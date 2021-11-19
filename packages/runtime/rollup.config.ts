import { defineConfig } from "rollup";
import ts from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default defineConfig([
  {
    input: "src/client.ts",
    output: {
      file: "lib/client.js",
      format: "cjs",
    },
    plugins: [ts({
      tsconfig: "./tsconfig.json",
    }), terser()],
  },
  {
    input: "src/server.ts",
    output: {
      file: "lib/server.js",
      format: "cjs",
    },
    plugins: [ts({
      tsconfig: "./tsconfig.json",
      // built by client
      declaration: false,
    }), commonjs(), json(), terser()],
  },
]);
