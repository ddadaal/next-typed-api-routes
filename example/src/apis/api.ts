/* eslint-disable max-len */
import { fromApi } from "@ddadaal/next-typed-api-routes/lib/client";

import type { LoginSchema } from "src/pages/api/login/[username]";
import type { RegisterSchema } from "src/pages/api/register/register";


export const api = {
  login: fromApi<LoginSchema>("GET", "/api/login/[username]"),
  register: fromApi<RegisterSchema>("POST", "/api/register/register"),
};
