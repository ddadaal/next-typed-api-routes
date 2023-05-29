import { createValidatorsFromSchema } from "../src/route/ajvRoute";
import schemas from "./schemas.json";

it("should correctly generate schemas", () => {
  createValidatorsFromSchema(schemas);
});
