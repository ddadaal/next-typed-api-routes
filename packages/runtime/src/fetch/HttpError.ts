import { HttpMethod } from "./fetch";

export const FETCH_ERROR = -2;
export const TYPE_ERROR = -1;

export interface OriginalRequest {
  method: HttpMethod;
  url: string;
  query?: unknown;
  body?: unknown;
  headers?: Record<string, string>;
}

/** A unified class for all errors */
export class HttpError<T = any> {

  /** A Server Error */
  get isFetchError() { return this.status === FETCH_ERROR; }
  get isTypeError() { return this.status === TYPE_ERROR; }

  constructor(
    public status: number,
    public data: T,
    public text?: string,
    public request?: OriginalRequest,
  ) {
  }
}
