import { Kind, Static, TAny, TIntersect, TNull, TObject, TUnion, TUnknown } from "@sinclair/typebox";
import fastJson from "fast-json-stringify";
import { NextApiRequest, NextApiResponse } from "next";

import { ajvOptions, createAjv } from "./ajv";
import { OrPromise, returnError, Serializer, ValueOf } from "./utils";

export type TypeboxReturnType = TObject | TNull | TIntersect | TUnion | TAny | TUnknown;

export interface TypeboxRouteSchema<
  TQuery extends TObject = TObject,
  TBody extends TObject = TObject,
  TResponses extends Record<number, TypeboxReturnType> = Record<number, TypeboxReturnType>,
> {
  method: string;
  query?: TQuery;
  body?: TBody;
  responses: TResponses;
}

export type TypeboxRawType<T> = 
  T extends undefined ? undefined 
    : T extends TypeboxReturnType ? Static<T>
      : T;


export type TypeboxRouteSchemaToSchema<TSchema extends TypeboxRouteSchema> = {
  query: TypeboxRawType<TSchema["query"]>;
  body: TypeboxRawType<TSchema["body"]>;
  responses: { [code in keyof TSchema["responses"] & number]: TypeboxRawType<TSchema["responses"][code]> }
}

export const typeboxRouteSchema = <
  TProps extends TypeboxRouteSchema,
>(props: TProps) => props;

export function typeboxRoute<TSchema extends TypeboxRouteSchema>(
  schema: TSchema,
  handler: (
    req: Omit<NextApiRequest, "body"> & {
      query: TypeboxRawType<TSchema["query"]>,
      body: TypeboxRawType<TSchema["body"]>,
    },
    res: NextApiResponse<
      TypeboxRawType<ValueOf<TSchema["responses"]>>
    >
  ) => OrPromise<Partial<{
    [code in keyof TSchema["responses"] & number]: TypeboxRawType<TSchema["responses"][code]>
  }> | void>,
): typeof handler {

  const ajv = createAjv();

  const query = schema.query && ajv.compile(schema.query);
  const body = schema.body && ajv.compile(schema.body);

  const responseSerializers = schema.responses && ((responses) => {
    const serializers = new Map<string, Serializer>();

    for (const [code, schema] of Object.entries(responses)) {
      if (schema[Kind] === "Object") {
        const serializer = fastJson(schema, { ajv: ajvOptions });
        serializers.set(code, serializer);
      }
    }
    return serializers;
  })(schema.responses);

  return async (req, res) => {

    if (query) {
      if (!query(req.query)) {
        returnError(res, "QUERY", query.errors);
        return;
      }
    }

    if (body) {
      if (!body(req.body)) {
        returnError(res, "BODY", body.errors);
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
        const serializer = responseSerializers?.get(code);
        const body = serializer ? serializer(respBody) : respBody;
        res.send(body);
      }
    }
  };
}




