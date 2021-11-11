export const FETCH_ERROR = -2;
export const TYPE_ERROR = -1;

/** A unified class for all errors */
export class HttpError<T = any> {
  data: T;
  status: number;
  text?: string;

  /** A Server Error */
  get isFetchError() { return this.status === FETCH_ERROR; }
  get isTypeError() { return this.status === TYPE_ERROR; }

  constructor(status: number, data: T, text?: string) {
    this.data = data;
    this.status = status;
    this.text = text;
  }
}
