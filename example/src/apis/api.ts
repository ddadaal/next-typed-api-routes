/* eslint-disable max-len */
import { fromApi } from "@ddadaal/next-typed-api-routes";

import type { LoginSchema } from "src/pages/api/login/[username]";

export const api = { "login": fromApi<LoginSchema>("GET", "/api/login/[username]") };
