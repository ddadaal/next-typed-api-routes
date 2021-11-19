export interface Schema<
  TQuerystring,
  TBody,
  TResponses,
> {
  query?: TQuerystring;
  body?: TBody;
  responses: TResponses;
}

export type GeneralSchema = Schema<any, any, any>;

export interface SchemaObject {
  description: string;
  properties: {
    query?: any;
    body?: any;
    responses:  { properties?: any };
  }
}

export type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type Responses<T extends GeneralSchema> = T["responses"];

export type ResponseBody<
  TSchema extends GeneralSchema,
  ResponseCode extends number = 200,
> =
  Awaited<Responses<TSchema>[ResponseCode]>;


export type SuccessResponse<T extends GeneralSchema> =
  Responses<T>[200] extends object | null
  ? Responses<T>[200]
  : Responses<T>[201] extends object | null
  ? Responses<T>[201]
  : Responses<T>[204] extends null
  ? null
  : never;
