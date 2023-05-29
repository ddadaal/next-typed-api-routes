import { z, zodRoute, zodRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";

export const ZodRouteSchema = zodRouteSchema({
  method: "POST",
  body: z.object({ error: z.boolean() }),
  query: z.object({ test: z.string() }),
  responses: {
    200: z.object({ hello: z.string() }),
    404: z.object({ error: z.string() }),
    500: z.null(),
  },
});

export default zodRoute(ZodRouteSchema, async (req) => {
  if (req.body.error) {
    return { 404: { error: "123" } };
  } else {
    return { 200: { hello: `${req.query.test}` } };
  }
});
