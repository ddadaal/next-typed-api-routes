import { Type, typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";

export const TypeboxRouteSchema = typeboxRouteSchema({
  method: "POST",
  body: Type.Object({ error: Type.Boolean() }),
  query: Type.Object({ test: Type.String() }),
  responses: {
    200: Type.Intersect([Type.Object({ hello: Type.String() })], Type.Object({})),
    404: Type.Object({ error: Type.String() }),
    405: Type.Any(),
    500: Type.Null(),
  },
});

export default typeboxRoute(TypeboxRouteSchema, async (req) => {

  if (req.body.error) {
    return { 404: { error: "123" } };
  } else {
    return { 200: { hello: `${req.query.test}` } };
  }
});
