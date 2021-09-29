/* eslint-disable max-len */
import { fromApi } from "next-typed-api-routes";

import type { LoginSchema } from "src/pages/api/login/[username]";

export const realApi = {
  "login": {
    "[username]": fromApi<LoginSchema>("GET", "/api/login/[username]"),
  },
};