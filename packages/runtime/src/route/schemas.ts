import Ajv, { Options, SchemaObject, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import addDraft2019Format from "ajv-formats-draft2019";
import fastJson from "fast-json-stringify";

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

  const ajvOptions: Options = { useDefaults: true, allowUnionTypes: true, coerceTypes: "array"  };

  // add shared models
  const ajv = new Ajv(ajvOptions);

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
        // deep clone the models
        // might be related to https://github.com/fastify/fast-json-stringify/issues/242
        // if not clone, some strange errors occur
        // the schemas are JSON data only, so stringify and parse works
        const models = JSON.parse(JSON.stringify(schemas.models));
        const serializer = fastJson(schema as any, { schema: models as any, ajv: ajvOptions });
        serializers.set(code, serializer);
      }
      return serializers;
    })(schema.properties.responses.properties);

    routeValiators.set(name, { query, body, responseSerializers });
  }

  return routeValiators;

}
