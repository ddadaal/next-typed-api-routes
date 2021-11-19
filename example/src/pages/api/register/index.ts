// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { route } from "@ddadaal/next-typed-api-routes-runtime";

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

export default route<RegisterSchema>("RegisterSchema", (req) => {
  const { password, username } = req.body;

  return { 200: { token: username + password } };
});
