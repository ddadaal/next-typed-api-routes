// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { staticRoute } from "@ddadaal/next-typed-api-routes-runtime";

export interface RegisterSchema {
  method: "POST";

  body: {
    /**
     * @maxLength 50
     */
    username: string;

    password: string;
  }

  responses: {
    200: { token: string; }
  }

}

export default staticRoute<RegisterSchema>("RegisterSchema", (req) => {
  const { password, username } = req.body;

  return { 200: { token: username + password } };
});
