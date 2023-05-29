/* eslint-disable max-len */

import { fromApi, fromTypeboxRoute, fromZodRoute } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { join } from "path";
import type { LoginSchema } from "src/pages/api/login/[username]";
import type { RegisterSchema } from "src/pages/api/register/index";
import type { TypeboxRouteSchema } from "src/pages/api/typeboxRoute/[test]";
import type { ZodRouteSchema } from "src/pages/api/zodRoute/[test]";



const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";


export const api = {
  login: fromApi<LoginSchema>("GET", join(basePath, "/api/login/[username]")),
  register: fromApi<RegisterSchema>("POST", join(basePath, "/api/register")),
  typeboxRoute: fromTypeboxRoute<typeof TypeboxRouteSchema>("POST", join(basePath, "/api/typeboxRoute/[test]")),
  zodRoute: fromZodRoute<typeof ZodRouteSchema>("POST", join(basePath, "/api/zodRoute/[test]")),
};
  