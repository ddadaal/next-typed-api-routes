import type { GeneralSchema, SuccessResponse } from "../types/schema";
import type {
  Querystring, RequestArgs,
} from "../types/request";
import { removeNullOrUndefinedKey } from "./utils";
import { failEvent, finallyEvent, prefetchEvent, successEvent } from "./events";
import { parseQueryToQuerystring } from "./parseQueryToQuerystring";
import { replacePathArgs } from "./replacePathArgs";

function isServer() {
  return typeof window === "undefined";
}

function isFormData(a: any): a is FormData {
  return !isServer() && a instanceof FormData;
}

export type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT";

let token = "";

export function changeBearerToken(newToken: string): void {
  token = newToken;
}


export function fullFetch(
  path: string,
  query?: Querystring,
  init?: RequestInit,
): Promise<Response> {
  const headers = token
    ? { ...init?.headers, "authorization": `Bearer ${token}` }
    : init?.headers ?? {};

  let url = path;
  if (query) {
    url += parseQueryToQuerystring(query);
  }

  return fetch(url,
    {
      ...init,
      headers,
      mode: "cors",
      // disable cache for IE11
      cache: "no-cache",
    });
}

export type FullFetch = typeof fullFetch;

export interface FetchInfo {
  path: string;
  method?: HttpMethod;
  query?: Querystring;
  body?: unknown;
  headers?: Record<string, string>;
}

export type JsonFetchResult<TResp> = TResp;

const SERVER_ERROR_STATUS = -2;
const CLIENT_ERROR_STATUS = -1;

export class HttpError<T = object | undefined> {
  data: T | undefined;
  status: number;
  text?: string;

  get isServerError() { return this.status === SERVER_ERROR_STATUS; }
  get isClientError() { return this.status === CLIENT_ERROR_STATUS; }
}

export function makeHttpError<T>(status: number, data: T, text?: string) {
  const error = new HttpError<T>();
  error.data = data;
  error.status = status;
  error.text = text;
  return error;
}

function tryParseJson(text: string): object | undefined {
  try {
    return JSON.parse(text);
  } catch (e) {
    return undefined;
  }
}

function checkIsJson(resp: Response) {
  const type = resp.headers.get("content-type");
  return type && type.includes("application/json");
}

/**
 * Fetch and returns as json.
 * @param info the fetch info
 * @throws {Response} If the request is successful but response is not json,
 * the response will be thrown
 * @throws {JsonFetchError} If the statusCode is not [200, 300), a error will be thrown
 */
export async function jsonFetch<T>(
  info: FetchInfo,
  signal?: AbortSignal,
): Promise<JsonFetchResult<T>> {

  const isForm = isFormData(info.body);

  prefetchEvent.execute(undefined);

  try {
    const resp = await fullFetch(info.path, info.query, {
      method: info.method ?? "GET",
      headers: {
        ...isForm ? undefined : { "content-type": "application/json" },
        ...info.headers,
      },
      body: isForm ? (info.body as any) : JSON.stringify(info.body),
      signal,
    });

    if (resp.ok) {
      if (checkIsJson(resp)) {
        const obj = await resp.json();
        successEvent.execute({ status: resp.status, data: obj });
        return obj;
      } else {
        successEvent.execute({ status: resp.status, data: resp });
        throw resp;
      }
    } else {
      const text = await resp.text();
      const payload = makeHttpError(resp.status, tryParseJson(text), text);
      failEvent.execute(payload);
      throw payload;
    }
  } catch (r) {
    // existence of r.type indicates it's a server error (node-fetch)
    if (r.name === "FetchError") {
      const payload = makeHttpError(SERVER_ERROR_STATUS, JSON.parse(JSON.stringify(r)));
      failEvent.execute(payload);
      throw payload;
    }
    // TypeError is client side fetch error
    if (r instanceof TypeError) {
      const payload = makeHttpError(CLIENT_ERROR_STATUS, r);
      failEvent.execute(payload);
      throw payload;
    }
    throw r;
  } finally {
    finallyEvent.execute(undefined);
  }

}

export type JsonFetch = typeof jsonFetch;

export function fromApi<TSchema extends GeneralSchema>(method: HttpMethod, url: string) {
  return function (
    args: RequestArgs<TSchema>,
    signal?: AbortSignal,
  ): Promise<JsonFetchResult<SuccessResponse<TSchema>>>  {

    const anyArgs = args as any;
    // replace path params using query
    const replacedPath = anyArgs.query
      ? replacePathArgs(url, anyArgs.query)
      : url;

    return jsonFetch({
      path: replacedPath,
      method: method,
      query: removeNullOrUndefinedKey(anyArgs.query),
      body: anyArgs.body,
    }, signal);
  };
}
