import { api } from "../src/apis/api";
import { test, expect } from '@playwright/test';

test("should call zodRoute", async ({ page }) => {
  const resp = await api.zodRoute({ body: { info: "test" }, query: { test: "123" } });

  expect(resp.hello).toBe("test 123");
});
