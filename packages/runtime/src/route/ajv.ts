import Ajv, { Options } from "ajv";
import addFormats from "ajv-formats";
import addDraft2019Format from "ajv-formats-draft2019";

export const ajvOptions: Options = { useDefaults: true, allowUnionTypes: true, coerceTypes: "array" };

export const createAjv = () => {
  // add shared models
  const ajv = new Ajv(ajvOptions);

  // add formats support
  addFormats(ajv);
  addDraft2019Format(ajv);

  return ajv;
};


