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

  const ajvOptions: Options = { allowUnionTypes: true, coerceTypes: "array"  };

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
        // Sometimes fastJson just fails. Just ignores it for now.
        try {
          const serializer = fastJson(schema as any, { schema: schemas.models as any, ajv: ajvOptions });
          serializers.set(code, serializer);
        } catch (e) {
          console.warn(`Failed to build ${name}'s ${code} response serializer. Ignored.`);
        }
      }
      return serializers;
    })(schema.properties.responses.properties);

    routeValiators.set(name, { query, body, responseSerializers });
  }

  return routeValiators;

}
