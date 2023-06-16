import type { Querystring } from "../types/request";
import type { AnySchema, SuccessResponse } from "../types/schema";
import { failEvent, finallyEvent, prefetchEvent, successEvent } from "./events";
import { FETCH_ERROR, HttpError, OriginalRequest, TYPE_ERROR } from "./HttpError";
import { parseQueryToQuerystring } from "./parseQueryToQuerystring";

function isServer() {
  return typeof window === "undefined";
}

function isFormData(a: any): a is FormData {
  return !isServer() && a instanceof FormData;
}

export type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH" | "PUT";


export function fullFetch(
  url: string,
  query?: Querystring,
  init?: RequestInit,
): Promise<Response> {
  if (query) {
    url += parseQueryToQuerystring(query);
  }

  return fetch(url,
    {
      mode: "cors",
      // disable cache for IE11
      cache: "no-cache",
      ...init,
    });
}

export type FullFetch = typeof fullFetch;

export interface FetchInfo {
  url: string;
  method?: HttpMethod;
  query?: Querystring;
  body?: unknown;
  headers?: Record<string, string>;
}

export type JsonFetchResult<TResp> = TResp;

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

type RejectHandler<TRej> = (reason: any) => TRej | PromiseLike<TRej>;

export class JsonFetchResultPromiseLike<T extends AnySchema>
implements PromiseLike<SuccessResponse<T>> {

  private promise: Promise<Response>;
  private httpErrorHandler: Map<number, (error: any) => unknown>;
  private request: OriginalRequest;

  constructor(
    promise: Promise<Response>,
    request: OriginalRequest,
  ) {
    this.promise = promise;
    this.httpErrorHandler = new Map();
    this.request = request;
  }

  then<TSuc = SuccessResponse<T>, TRej = never>(
    onfulfilled?: ((value: SuccessResponse<T>) => TSuc | PromiseLike<TSuc>) | null,
    onrejected?: ((reason: any) => TRej | PromiseLike<TRej>) | null,
  ): Promise<TSuc | TRej> {
    return this.promise
      .then(async (resp) => {
        if (resp.ok) {
          if (resp.status === 204) {
            const obj = null as any;
            successEvent.execute({ status: 204, data: obj });
            return onfulfilled ? onfulfilled(obj) : obj;
          } else if (checkIsJson(resp)) {
            const obj = await resp.json();
            successEvent.execute({ status: resp.status, data: obj });
            return onfulfilled ? onfulfilled(obj) : obj;
          } else {
            successEvent.execute({ status: resp.status, data: resp });
            throw resp;
          }
        } else {

          const text = await resp.text();
          const payload = new HttpError(resp.status, tryParseJson(text), text, this.request);

          const handler = this.httpErrorHandler.get(resp.status);

          if (handler) {
            // if a handler is registered to the code,
            // don't fire failEvent
            const val = handler(payload.data);
            return onrejected ? onrejected(val) : val;
          } else {
            failEvent.execute(payload);
            throw payload;
          }
        }
      }).catch((r) => {

        const handleOrThrow = (payload: any) => {
          if (onrejected) {
            onrejected(payload);
          } else {
            throw payload;
          }
        };

        if (r.name === "FetchError") {
          const payload = new HttpError(FETCH_ERROR, r, undefined, this.request);
          failEvent.execute(payload);
        } else if (r instanceof TypeError) {
          const payload = new HttpError(TYPE_ERROR, r, undefined, this.request);
          failEvent.execute(payload);
        }

        // already handle or throw
        handleOrThrow(r);
      }).finally(() => {
        finallyEvent.execute(undefined);
      });
  }

  /**
   * Attach an error handler specific to a status code.
   *
   * The handler will be called when this code is received.
   * The return value of the handler will be called with onrejected.
   *
   * @param code http status code
   * @param handler handler for this type of code
   * @returns A Promise
   */
  httpError<Code extends number>(
    code: Code, handler: (err: T["responses"][Code]) => any,
  ): JsonFetchResultPromiseLike<T> {
    this.httpErrorHandler.set(code, handler);
    return this as any;
  }

  catch<TRej = never>(onrejected?: RejectHandler<TRej> | null) {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: () => any): Promise<unknown> {
    return this.then(
      (v) => {
        onfinally?.();
        return v;
      },
      (r) => {
        onfinally?.();
        return r;
      });
  }

}

/**
 * Fetch and returns as json.
 * @param info the fetch info
 * @throws {Response} If the request is successful but response is not json,
 * the response will be thrown
 * @throws {JsonFetchError} If the statusCode is not [200, 300), a error will be thrown
 */
export function jsonFetch<T extends AnySchema>(
  info: FetchInfo,
  signal?: AbortSignal,
): JsonFetchResultPromiseLike<T> {

  const isForm = isFormData(info.body);

  prefetchEvent.execute(undefined);

  return new JsonFetchResultPromiseLike(fullFetch(info.url, info.query, {
    method: info.method ?? "GET",
    headers: {
      ...isForm ? undefined : { "content-type": "application/json" },
      ...info.headers,
    },
    body: isForm ? (info.body as any) : JSON.stringify(info.body),
    signal,
  }), {
    method: info.method ?? "GET", url: info.url,
    body: info.body, headers: info.headers,
    query: info.query,
  });
}

export type JsonFetch = typeof jsonFetch;

