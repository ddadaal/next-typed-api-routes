import { createValidatorsFromSchema } from "../src/route/schemas";
import schemas from "./schemas.json";

it("should correctly generate schemas", () => {
  createValidatorsFromSchema(schemas);
});
