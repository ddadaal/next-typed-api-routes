/* eslint-disable max-len */

import { fromApi } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";


import type { LoginSchema } from "src/pages/api/login/[username]";
import type { RegisterSchema } from "src/pages/api/register/index";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";


export const api = {
  login: fromApi<LoginSchema>("GET", join(basePath, "/api/login/[username]")),
  register: fromApi<RegisterSchema>("POST", join(basePath, "/api/register")),
};
  