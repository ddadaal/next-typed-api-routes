import { TypeboxRouteSchema, TypeboxRouteSchemaToSchema } from "../route/typeboxRoute";
import { ZodRouteSchema, ZodRouteSchemaToSchema } from "../route/zodRoute";
import { AnySchema, RequestArgs } from "../types";
import { HttpMethod, jsonFetch, JsonFetchResultPromiseLike } from "./fetch";
import { replacePathArgs } from "./replacePathArgs";
import { removeNullOrUndefinedKey } from "./utils";

/**
 * Config for api client
 */
interface ApiClientConfig {
  /**
   * The baseUrl for all requests
   */
  baseUrl?: string;

  /**
   * Extra headers passed in every requests
   */
  headers?: Record<string, string>;
}

/**
 * Create a apiObject that will be used in generated API file
 * @param config Client config
 * @returns Api client that will be used in generated API file
 */
export const createApiClient = (config: ApiClientConfig) => {

  function fromStaticRoute<TSchema extends AnySchema>(method: HttpMethod, url: string) {
    return function(
      args: RequestArgs<TSchema>,
      signal?: AbortSignal,
    ): JsonFetchResultPromiseLike<TSchema> {

      const anyArgs = args as any;
      // replace path params using query
      const replacedPath = anyArgs.query
        ? replacePathArgs(url, anyArgs.query)
        : url;

      return jsonFetch({
        url: (config.baseUrl ?? "") + replacedPath,
        method: method,
        query: removeNullOrUndefinedKey(anyArgs.query),
        body: anyArgs.body,
        headers: config.headers,
      }, signal);
    };
  }

  function fromZodRoute<TSchema extends ZodRouteSchema>(method: HttpMethod, url: string) {
    return fromStaticRoute<ZodRouteSchemaToSchema<TSchema>>(method, url);
  }

  function fromTypeboxRoute<TSchema extends TypeboxRouteSchema>(method: HttpMethod, url: string) {
    return fromStaticRoute<TypeboxRouteSchemaToSchema<TSchema>>(method, url);
  }

  return {
    fromStaticRoute,
    fromZodRoute,
    fromTypeboxRoute,
  };
};
