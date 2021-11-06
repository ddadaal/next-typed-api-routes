import { defineConfig } from "rollup";
import ts from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default defineConfig({
  input: "src/client.ts",
  output: {
    file: "lib/client.js",
    format: "cjs",
  },
  plugins: [ts({ tsconfig: "./tsconfig.json" }), terser()],
});
