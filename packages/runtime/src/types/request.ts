import { AnySchema } from "./schema";

export type SelectNotUndefined<T extends {
  query: unknown;
  body: unknown;
}> =
  ({ query: T["query"] } extends { query: object } ? { query: T["query"]} : {}) &
  ({ body: T["body"] } extends { body: object } ? { body: T["body"]} : {});

export type RequestArgs<TSchema extends AnySchema> = SelectNotUndefined<{
  query: TSchema["query"];
  body: TSchema["body"];
}>;

export type Querystring = Record<string, string | string[] | number | undefined>;


