import { expect, test } from "@playwright/test";

import { api } from "../src/apis/api";

test("should call zodRoute", async () => {
  const resp = await api.zodRoute({ body: { error: false }, query: { test: "123" } });

  expect(resp.hello).toBe("123");
});

test("zodRoute should handler error", async () => {
  const error = await api.zodRoute({ body: { error: true }, query: { test: "123" } })
    .httpError(404, (err) => {
      expect(err.error).toBe("error");
      return err;
    })
    .then(() => undefined)
    .catch((e) => e);

  expect(error).toBeDefined();
});

test("should call zodRoute from browser", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.click("#zodRoute button");

  const text = await page.$("#zodRoute p");

  expect(await text?.innerText()).toBe("123");
});

test("should call typeboxRoute", async () => {
  const resp = await api.typeboxRoute({ body: { error: false }, query: { test: "123" } });

  expect(resp.hello).toBe("123");
});

test("typeboxRoute should handler error", async () => {
  const error = await api.typeboxRoute({ body: { error: true }, query: { test: "123" } })
    .httpError(404, (err) => {
      expect(err.error).toBe("error");
      return err;
    })
    .then(() => undefined)
    .catch((e) => e);

  expect(error).toBeDefined();
});

test("should call typeboxRoute from browser", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.click("#typeboxRoute button");

  const text = await page.$("#typeboxRoute p");

  expect(await text?.innerText()).toBe("123");
});

test("should call register", async () => {
  const resp = await api.register({ body: { username: "123", password: "123" } });

  expect(resp.token).toBe("123123");
});

test("should call login", async () => {
  const resp = await api.login({ query: { password: "123@123.com", username: "123@123.com" } });

  expect(resp.token).toBe("123@123.com");
});

test("should validate email", async () => {
  const resp = await api.login({ query: { password: "123", username: "123" } }) 
    .httpError(400, (err: any) => {
      expect(err.code).toBe("QUERY_VALIDATION_ERROR");
      return err;
    }).then(() => undefined, (e) => e);

  expect(resp).toBeDefined();

});

test("should call login from browser", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.fill("#ajvRoute #username", "123@123.com");
  await page.fill("#ajvRoute #password", "123@123.com");
  await page.click("#ajvRoute #submit");

  const text = await page.$("#ajvRoute #result");

  expect(await text?.innerText()).toBe("Completed.123@123.com");
});

test("should handle error in browser", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await page.fill("#ajvRoute #username", "123@123.com");
  await page.fill("#ajvRoute #password", "12312312");
  await page.click("#ajvRoute #submit");

  const text = await page.$("#ajvRoute #result");

  expect(await text?.innerText()).toBe("401 NotExists");
});
