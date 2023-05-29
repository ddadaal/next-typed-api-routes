import { NextApiResponse } from "next";

export type ValueOf<T> = T[keyof T];

export type OrPromise<T> = T | Promise<T>;

export function returnError(
  res: NextApiResponse, part: "QUERY" | "BODY", errors?: unknown,
) {
  res.status(400).json({
    code: part + "_VALIDATION_ERROR",
    errors,
  });
}

export type Serializer = (doc: string) => any;
