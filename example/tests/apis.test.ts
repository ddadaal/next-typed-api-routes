import { api } from "../src/apis/api";

it("should call zodRoute", async () => {
  const resp = await api.zodRoute({ body: { info: "test" }, query: { test: "123" } });

  expect(resp.hello).toBe("test 123");
});
