import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { OrPromise, returnError, ValueOf } from "./utils";

export interface ZodRouteSchema<
  TQuery extends z.ZodType = z.ZodType,
  TBody extends z.ZodType = z.ZodType,
  TResponses extends Record<number, z.ZodType> = Record<number, z.ZodType>,
> {
  method: string;
  query?: TQuery;
  body?: TBody;
  responses: TResponses;
}

export type ZodRawType<T> = 
  T extends undefined ? undefined 
    : T extends z.ZodType ? z.infer<T>
      : T;

export type ZodRouteSchemaToSchema<TSchema extends ZodRouteSchema> = {
  query: ZodRawType<TSchema["query"]>;
  body: ZodRawType<TSchema["body"]>;
  responses: { [code in keyof TSchema["responses"] & number]: ZodRawType<TSchema["responses"][code]> }
}

export const zodRouteSchema = <
  TProps extends ZodRouteSchema,
>(props: TProps) => props;

export function zodRoute<TSchema extends ZodRouteSchema>(
  schema: TSchema,
  handler: (
    req: Omit<NextApiRequest, "body"> & {
      query: ZodRawType<TSchema["query"]>,
      body: ZodRawType<TSchema["body"]>,
    },
    res: NextApiResponse<
      ZodRawType<ValueOf<TSchema["responses"]>>
    >
  ) => OrPromise<Partial<{
    [code in keyof TSchema["responses"] & number]: ZodRawType<TSchema["responses"][code]>
  }> | void>,
): typeof handler {

  return async (req, res) => {
    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        returnError(res, "QUERY", result.error);
        return;
      }
    }

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        returnError(res, "BODY", result.error);
        return;
      }
    }

    const resp = await handler(req, res);

    if (resp) {

      res.setHeader("content-type", "application/json");

      const code = Object.keys(resp)[0];
      res.status(Number(code));

      const respBody = resp[code];

      res.send(respBody);
    }
  };
}




