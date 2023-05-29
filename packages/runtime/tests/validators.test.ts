import { createValidatorsFromStaticSchema } from "../src/route/staticRoute";
import schemas from "./schemas.json";

it("should correctly generate schemas", () => {
  createValidatorsFromStaticSchema(schemas);
});
