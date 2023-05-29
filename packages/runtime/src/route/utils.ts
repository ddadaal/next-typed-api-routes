import { NextApiResponse } from "next";
import { z } from "zod";

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

export type RawType<T> = T extends z.ZodType ? z.infer<T> : T;

