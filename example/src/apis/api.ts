/* eslint-disable max-len */
import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";

import type { LoginSchema } from "src/pages/api/login/[username]";
import type { RegisterSchema } from "src/pages/api/register/index";


export const api = {
  login: fromApi<LoginSchema>("GET", "/api/login/[username]"),
  register: fromApi<RegisterSchema>("POST", "/api/register"),
};
  