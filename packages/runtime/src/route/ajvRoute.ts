import Ajv, { Options, SchemaObject, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import addDraft2019Format from "ajv-formats-draft2019";
import fastJson from "fast-json-stringify";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

import type { AnySchema } from "../types/schema";
import { OrPromise, returnError, ValueOf } from "./utils";

type Serializer = (doc: string) => any;

export interface Validator {
  query?: ValidateFunction;
  body?: ValidateFunction;
  responseSerializers?: Map<string, Serializer>;
}

interface SchemaFileContent {
  models: Record<string, SchemaObject>;
  routes: Record<string, SchemaObject>;
}

export function createValidatorsFromSchema(schemas: SchemaFileContent) {

  const ajvOptions: Options = { useDefaults: true, allowUnionTypes: true, coerceTypes: "array" };

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


let validators: Map<string, Validator>;



export function route<S extends AnySchema>(
  schemaName: string,
  handler: (
    req: Omit<NextApiRequest, "body"> & {
      query: S["query"],
      body: S["body"],
    },
    res: NextApiResponse<ValueOf<S["responses"]>>
  ) => OrPromise<Partial<S["responses"]> | void>,
): typeof handler {

  if (validators) {
    const schemas = JSON.parse(fs.readFileSync("./api-routes-schemas.json", "utf8"));
    validators = createValidatorsFromSchema(schemas);
  }

  const validator = validators.get(schemaName);

  if (!validator) {
    throw new RangeError(`schemaName ${schemaName} is not valid.`);
  }

  return async (req, res) => {
    if (validator.query) {
      if (!validator.query(req.query)) {
        returnError(res, "QUERY", validator.query.errors);
        return;
      }
    }

    if (validator.body) {
      if (!validator.body(req.body)) {
        returnError(res, "BODY", validator.body.errors);
        return;
      }
    }

    const resp = await handler(req, res);

    if (resp) {

      res.setHeader("content-type", "application/json");

      const code = Object.keys(resp)[0];
      res.status(Number(code));

      const respBody = resp[code];

      if (code === "204" || respBody === null) {
        // @ts-ignore
        res.send(undefined);
      } else if (respBody) {
        const serializer = validator.responseSerializers?.get(code);
        const body = serializer ? serializer(respBody) : respBody;
        res.send(body);
      }

    }
  };
}

