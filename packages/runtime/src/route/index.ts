import type { ErrorObject } from "ajv";
import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

import type { Schema } from "../types/schema";
import { createValidatorsFromSchema } from "./schemas";

// Hardcoded schemas.json path
const schemas = JSON.parse(fs.readFileSync("./api-routes-schemas.json", "utf8"));

type ValueOf<T> = T[keyof T];

const validators = createValidatorsFromSchema(schemas);

function reportError(
  res: NextApiResponse, part: "QUERY" | "BODY", errors?: ErrorObject[] | null) {
  res.status(400).json({
    code: part + "_VALIDATION_ERROR",
    errors,
  });
}

type OrPromise<T> = T | Promise<T>;

export function route<S extends Schema<any, any, any>>(
  schemaName: string,
  handler: (
    req: Omit<NextApiRequest, "body"> & {
      query: S["query"],
      body: S["body"],
    },
    res: NextApiResponse<ValueOf<S["responses"]>>
  ) => OrPromise<Partial<S["responses"]> | void>,
): typeof handler {

  const validator = validators.get(schemaName);

  if (!validator) {
    throw new RangeError(`schemaName ${schemaName} is not valid.`);
  }

  return async (req, res) => {
    if (validator.query) {
      if (!validator.query(req.query)) {
        reportError(res, "QUERY", validator.query.errors);
        return;
      }
    }

    if (validator.body) {
      if (!validator.body(req.body)) {
        reportError(res, "BODY", validator.body.errors);
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
        res.send(undefined);
      } else if (respBody) {
        const serializer = validator.responseSerializers?.get(code);
        const body = serializer ? serializer(respBody) : respBody;
        res.send(body);
      }

    }
  };
}

