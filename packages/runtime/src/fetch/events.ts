/* eslint-disable max-len */
import type { HttpError } from "./HttpError";

class Event<TArgs> {
  handlers = [] as Array<(args: TArgs) => void>;

  register = (handler: (args: TArgs) => void) => {
    this.handlers.push(handler);

    return () => this.unregister(handler);
  };

  execute = (args: TArgs) => {
    this.handlers.forEach((h: (arg0: TArgs) => void) => h(args));
  };

  unregister = (handler: (args: TArgs) => void) => {
    this.handlers = this.handlers.filter((x) => x !== handler);
  };
}

export const prefetchEvent = new Event<undefined>();
export const successEvent = new Event<{ status: number; data: any }>();

/**
 * Fired when
 * - FetchError is raised (node-fetch exclusive, https://github.com/node-fetch/node-fetch/blob/main/docs/ERROR-HANDLING.md)
 * - TypeError is raised (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#checking_that_the_fetch_was_successful)
 * - Responses outside of [200, 300) is received
 *
 * Note, errors handled by httpError will not cause failEvent to fire.
 */
export const failEvent = new Event<HttpError>();
export const finallyEvent = new Event<undefined>();

