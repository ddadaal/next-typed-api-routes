// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { staticRoute } from "@ddadaal/next-typed-api-routes-runtime";

/** You can use types anywhere. Recommend to use import type */
import type { LoginInfo } from "../../../models/LoginInfo";

export interface LoginSchema {
  method: "GET";

  query: LoginInfo & {
    testNumberQuery?: number;
  };

  responses: {
    200: { token: string; }
    401: { reason: "NotExists" | "WrongPassword" }
    403: null,
  }

}

export default staticRoute<LoginSchema>("LoginSchema", (req) => {
  const { password, username } = req.query;

  if (username === password) {
    /** Return a { [statusCode]: payload } object
     *  to use faster JSON serialization */
    return { 200: { token: username } };
  } else if (password === "nullnull") {
    return { 403: null };
  } else {
    return { 401: { reason: "NotExists" } };
  }
});
