/* eslint-disable max-len */

import { apiClient } from "src/apis/client";
import type { LoginSchema } from "src/pages/api/login/[username]";
import type { RegisterSchema } from "src/pages/api/register/index";
import type { TypeboxRouteSchema } from "src/pages/api/typeboxRoute/[test]";
import type { ZodRouteSchema } from "src/pages/api/zodRoute/[test]";


export const api = {
  login: apiClient.fromStaticRoute<LoginSchema>("GET", "/api/login/[username]"),
  register: apiClient.fromStaticRoute<RegisterSchema>("POST", "/api/register"),
  typeboxRoute: apiClient.fromTypeboxRoute<typeof TypeboxRouteSchema>("POST", "/api/typeboxRoute/[test]"),
  zodRoute: apiClient.fromZodRoute<typeof ZodRouteSchema>("POST", "/api/zodRoute/[test]"),
};
