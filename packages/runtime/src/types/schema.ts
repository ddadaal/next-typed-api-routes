export interface Schema<
  TQuerystring,
  TBody,
  TResponses extends Record<number, unknown>,
> {
  query?: TQuerystring;
  body?: TBody;
  responses: { [code in keyof TResponses]: TResponses[code] };
}

export type AnySchema = Schema<unknown, unknown, Record<number, unknown>>;

export interface SchemaObject {
  description: string;
  properties: {
    query?: unknown;
    body?: unknown;
    responses: { properties?: unknown };
  }
}

export type Responses<T extends AnySchema> = T["responses"];

export type ResponseBody<
  TSchema extends AnySchema,
  ResponseCode extends number = 200,
> = Awaited<Responses<TSchema>[ResponseCode]>;


export type SuccessResponse<T extends AnySchema> =
  Responses<T>[200] extends object | null
  ? Responses<T>[200]
  : Responses<T>[201] extends object | null
  ? Responses<T>[201]
  : Responses<T>[204] extends null
  ? null
  : never
;
