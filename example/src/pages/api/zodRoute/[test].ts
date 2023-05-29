import { z, zodRoute, zodRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";

export const ZodRouteSchema = zodRouteSchema({
  method: "POST",
  body: z.object({ info: z.string() }),
  query: z.object({ test: z.string() }),
  responses: {
    200: z.object({ hello: z.string() }),
    404: z.object({ error: z.string() }),
  },
});

export default zodRoute(ZodRouteSchema, async (req) => {
  return { 200: { hello: `${req.body.info} + ${req.query.test}` } };
});
