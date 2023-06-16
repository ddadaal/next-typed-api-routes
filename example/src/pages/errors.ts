import { type HttpError } from "@ddadaal/next-typed-api-routes-runtime";

export const formatHttpErrors = (e: HttpError[]) => JSON.stringify(e);
