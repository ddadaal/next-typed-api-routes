import { ESLint } from "eslint";

export async function lint(cwd: string, content: string) {
  const eslint = new ESLint({
    cwd,
    fix: true,
  });

  const [result] = await eslint.lintText(content);
  return result.output ?? "";
}
