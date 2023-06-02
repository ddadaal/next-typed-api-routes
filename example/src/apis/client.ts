import { createApiClient } from "@ddadaal/next-typed-api-routes-runtime";

export const apiClient = createApiClient({
  baseUrl: typeof window === "undefined" ? `http://localhost:${process.env.PORT || 3000}` : "",
});
