import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { OrPromise, RawType, returnError, ValueOf } from "./utils";

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

type ZodInferOrUndefined<T extends z.ZodType | undefined> = T extends undefined ? undefined : z.infer<NonNullable<T>>;

export type ZodRouteSchemaToSchema<TSchema extends ZodRouteSchema> = {
  query: ZodInferOrUndefined<TSchema["query"]>;
  body: ZodInferOrUndefined<TSchema["body"]>;
  responses: { [code in keyof TSchema["responses"] & number]: ZodInferOrUndefined<TSchema["responses"][code]> }
}

export const zodRouteSchema = <
  TProps extends ZodRouteSchema,
>(props: TProps) => props;

export function zodRoute<TSchema extends ZodRouteSchema>(
  schema: TSchema,
  handler: (
    req: Omit<NextApiRequest, "body"> & {
      query: RawType<TSchema["query"]>,
      body: RawType<TSchema["body"]>,
    },
    res: NextApiResponse<
      RawType<ValueOf<TSchema["responses"]>>
    >
  ) => OrPromise<Partial<{
    [code in keyof TSchema["responses"]]: RawType<ValueOf<TSchema["responses"][code]>>
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




