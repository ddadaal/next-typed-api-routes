#!/usr/bin/env node
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

import { generateClients } from "./generateClients";
import { generateSchemasJson } from "./generateSchemas";

yargs(hideBin(process.argv))
  .command("schema", "Generate schemas.json", (yargs) => {
    return yargs.options({
      apiRoutesPath: { type: "string", default: "src/pages/api" },
      tsconfigPath: { type: "string", default: "./tsconfig.json" },
    });
  }, (argv) => {
    generateSchemasJson(argv);
  })
  .command("client", "Generate API Clients", (yargs) => {
    return yargs.options({
      apiFilePath: {
        type: "string",
        desc: "The output file for the typed API functions",
        default: "src/apis/api.ts",
      },
      apiRoutesPath: { type: "string", default: "src/pages/api" },
      clientObjectName: { type: "string", default: "apiClient" },
      clientObjectImportPath: { type: "string", default: "src/apis/client" },
      apiObjectName: { type: "string", default: "api" },
    });
  }, (argv) => {
    generateClients(argv);
  })
  .scriptName("ntar")
  .demandCommand()
  .help()
  .argv;

