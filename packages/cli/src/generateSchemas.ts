import * as fs from "fs";
import path from "path";
import * as tsj from "ts-json-schema-generator";
import {
  BaseType,
  createFormatter, createParser, SchemaGenerator, SubNodeParser,
} from "ts-json-schema-generator";
import ts from "typescript";

import { checkApiRoutesPath } from "./errors";
import { listEndpoints } from "./generateClients";

const fsp = fs.promises;

function stringify(obj: object): string {
  return JSON.stringify(obj, null, 2);
}

// Change $ref from `#/definitions/${id}` to format `${id}#`
function changeRef(schema: object) {
  if (typeof schema === "object") {
    for (const key in schema) {
      if (key === "$ref") {
        const refValue = schema[key] as string;
        const value = refValue.split("/").slice(2).join("/");
        schema[key] = `${value}#`;
      } else {
        changeRef(schema[key]);
      }
    }
  }
}

export class IgnoreArrowFunctionParser implements SubNodeParser {
  supportsNode(node: ts.Node): boolean {
    return ts.isArrowFunction(node);
  }
  createType(): BaseType {
    return new tsj.AnyType();
  }
}

function addIdAndTitle(obj: object) {
  for (const key in obj) {
    obj[key].$id = key;
    obj[key].title = key;
  }
}

interface GenerateSchemaArgs {
  apiRoutesPath?: string;
  tsconfigPath?: string;
  throwWhenError?: boolean;
  verbose?: boolean;
}

const SCHEMAS_JSON_PATH = path.resolve("api-routes-schemas.json");

export async function generateSchemasJson({
  apiRoutesPath = "src/pages/api",
  tsconfigPath = "./tsconfig.json",
  throwWhenError = false,
  verbose = false,
}: GenerateSchemaArgs) {

  // check if apiRoutesPath exists
  await checkApiRoutesPath(apiRoutesPath);

  // list all endpoints
  const { endpoints } = await listEndpoints(apiRoutesPath);

  // for all endpoints, generate models

  type SchemaMap = NonNullable<tsj.Schema["definitions"]>;

  const models = {} as SchemaMap;
  const routeSchemas = {} as SchemaMap;


  const verboseLog: typeof console.log = (...args) =>  {
    if (verbose) {
      console.log(...args);
    }
  }

  for (const endpoint of endpoints) {
    const config: tsj.Config = {
      jsDoc: "extended",
      expose: "all",
      type: endpoint.schemaName,
      tsconfig: tsconfigPath,
      skipTypeCheck: true,
      sortProps: true,
    };

    verboseLog("Generating schema %o", endpoint);

    try {
      const program = tsj.createProgram(config);
      const parser = createParser(program, config, (prs) => {
        prs.addNodeParser(new IgnoreArrowFunctionParser());
      });
      const formatter = createFormatter(config);
      const generator = new SchemaGenerator(program, parser, formatter, config);

      const allDefinitions = generator.createSchema()
        .definitions;

      verboseLog("Definitions: %o", allDefinitions);

      for (const key in allDefinitions) {
        if (key === "File" || key === "Blob") { continue; }
        const safeKey = encodeURIComponent(key);
        if (key.endsWith("Schema")) {
          if (routeSchemas[safeKey]) {
            console.warn("Duplicate schema name: " + key);
          }
          routeSchemas[safeKey] = allDefinitions[key];
        } else {
          if (models[safeKey]) {
            console.warn("Duplicate model name: " + key);
          }
          models[safeKey] = allDefinitions[key];
        }
      }
    } catch(e) {
      console.error(`Error when generating schema for ${endpoint.filePath}.`, e);
      if (throwWhenError) {
        throw e;
      }
    }
  }

  addIdAndTitle(models);
  addIdAndTitle(routeSchemas);
  changeRef(models);
  changeRef(routeSchemas);

  // write to src/apis/schemas.json file on the module dir
  await fsp.writeFile(
    SCHEMAS_JSON_PATH,
    stringify({ routes: routeSchemas, models: models }),
  );
}

