import Ajv, { SchemaObject, ValidateFunction } from "ajv";
import fastJson from "fast-json-stringify";
import addDraft2019Format from "ajv-formats-draft2019";
import addFormats from "ajv-formats";

type Serializer = (doc: string) => any;

interface Validator {
  query?: ValidateFunction;
  body?: ValidateFunction;
  responseSerializers?: Map<string, Serializer>;
}

interface SchemaFileContent {
  models: Record<string, SchemaObject>;
  routes: Record<string, SchemaObject>;
}

export function createValidatorsFromSchema(schemas: SchemaFileContent) {

  // add shared models
  const ajv = new Ajv({ allowUnionTypes: true, coerceTypes: "array" });

  // add formats support
  addFormats(ajv);
  addDraft2019Format(ajv);

  // add schemas
  for (const model of Object.values(schemas.models)) {
    ajv.addSchema(model);
  }

  // compile validatiors
  const routeValiators = new Map<string, Validator>();

  for (const [name, schema] of Object.entries(schemas.routes)) {
    const query = schema.properties.query && ajv.compile(schema.properties.query);
    const body = schema.properties.body && ajv.compile(schema.properties.body);

    const responseSerializers = schema.properties.responses && ((responses) => {
      const serializers = new Map<string, Serializer>();

      for (const [code, schema] of Object.entries(responses)) {
        serializers.set(code,
          fastJson(schema as any, { schema: schemas.models as any }));
      }
      return serializers;
    })(schema.properties.responses.properties);

    routeValiators.set(name, { query, body, responseSerializers });
  }

  return routeValiators;

}
