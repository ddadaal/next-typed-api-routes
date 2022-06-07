import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import ts from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import { terser } from "rollup-plugin-terser";

export default defineConfig([
  {
    input: "src/client.ts",
    output: {
      file: "lib/client.js",
      format: "cjs",
    },
    plugins: [ts({
      tsconfig: "./tsconfig.build.json",
    }), terser()],
  },
  {
    input: "src/server.ts",
    output: {
      file: "lib/server.js",
      format: "cjs",
    },
    plugins: [ts({
      tsconfig: "./tsconfig.build.json",
      // built by client
      declaration: false,
    }), commonjs(), json(), terser()],
  },
]);
