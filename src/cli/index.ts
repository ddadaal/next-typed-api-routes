#!/usr/bin/env node
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { generateSchemasJson } from "./generateSchemas";
import { generateClients } from "./generateClients";

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
      fetchImport: { type: "string", default: "next-typed-api-routes" },
      eslintCwd: {
        type: "string",
        desc: "cwd for linting the output api file using eslint",
        default: process.cwd(),
        defaultDescription: "process.cwd()",
      },
    });
  }, (argv) => {
    generateClients(argv);
  })
  .scriptName("ntar")
  .demandCommand()
  .help()
  .argv;

