import fs from "fs";
import path from "path";
import ts from "typescript";
import { EOL } from "os";
import { checkApiRoutesPath, createDir } from "./errors";

const eslintMaxLen = "/* eslint-disable max-len */";

const getFileNameInfo = (filename: string) => {
  const parts = filename.split(".");

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ext = parts.pop()!;

  return [parts.join("."), ext];
};

interface Import {
  interfaceName: string;
  relativePath: string;
}

interface Endpoint {
  schemaName: string;
  interfaceName: string;
  method: string;
  url: string;
}

async function getApiObject(
  rootDir: string, relativePath: string,
  endpoints: Endpoint[],
  imports: Import[],
) {

  for (const f of await fs.promises.readdir(rootDir)) {
    const p = path.join(rootDir, f);

    const stat = await fs.promises.stat(p);

    const [filename, ext] = getFileNameInfo(f);

    if (stat.isFile()) {
      if (ext === "ts") {
        // read the file and get the schema name
        const sourceFile = ts.createSourceFile(
          p,
          await fs.promises.readFile(p, "utf8"),
          ts.ScriptTarget.Latest,
        );

        // find the interface with name ending with "Schema"
        const interfaceStatement = sourceFile.statements.find((x) =>
          ts.isInterfaceDeclaration(x)
          && x.name.text.endsWith("Schema") && x.name.text.length > "Schema".length);

        if (!interfaceStatement) {
          continue;
        }

        const interfaceDeclaration = interfaceStatement as ts.InterfaceDeclaration;

        const interfaceName = interfaceDeclaration.name.text;

        // Get method from method property
        let methodName: string | undefined = undefined;
        for (const s of interfaceDeclaration.members) {
          if (ts.isPropertySignature(s) &&
              ts.isIdentifier(s.name) && s.name.text === "method" &&
              s.type && ts.isLiteralTypeNode(s.type) && ts.isStringLiteral(s.type.literal)
          ) {
            methodName = s.type.literal.text;
            break;
          }
        }

        if (!methodName) {
          continue;
        }

        // Get URL from file path
        imports.push({
          interfaceName,
          relativePath: relativePath + "/" + filename,
        });

        // LoginSchema -> login
        const schemaName = interfaceName[0].toLocaleLowerCase()
        + interfaceName.substr(1, interfaceName.length - "Schema".length - 1);

        endpoints.push({
          method: methodName,
          schemaName,
          interfaceName,
          url: "/api/" + relativePath + (filename === "index" ? "" : ("/" + filename)),
        });
      }
    } else {
      await getApiObject(p, path.join(relativePath, f), endpoints, imports);
    }
  }
}

export interface GenerateApiClientsArgs {
  apiFilePath?: string;
  apiRoutesPath?: string;
  fetchImport?: string;
  apiObjectName?: string;
}

export async function generateClients({
  apiFilePath = "src/apis/api.ts",
  apiRoutesPath = "src/pages/api",
  fetchImport = "@ddadaal/next-typed-api-routes-runtime/lib/client",
  apiObjectName = "api",
}: GenerateApiClientsArgs) {

  if (!apiRoutesPath.endsWith("/")) {
    apiRoutesPath += "/";
  }

  await checkApiRoutesPath(apiRoutesPath);
  await createDir(apiFilePath);

  const imports = [] as Import[];
  const endpoints = [] as Endpoint[];

  await getApiObject(apiRoutesPath, "", endpoints, imports);

  // use string instead of ts factories to easily style the code and reduce complexity
  const apiObjDeclaration = `
export const ${apiObjectName} = {
${endpoints.map((e) =>
    `  ${e.schemaName}: fromApi<${e.interfaceName}>("${e.method}", "${e.url}"),`
  ).join(EOL)}
};
  `;

  const fetchApiImportDeclaration =
    `import { fromApi } from "${fetchImport}";`;

  const importDeclarations = imports.map(({ relativePath, interfaceName }) => (
    `import type { ${interfaceName} } from "${apiRoutesPath + relativePath}";`
  )).join(EOL);

  const content =
    eslintMaxLen + EOL +
    fetchApiImportDeclaration +
    EOL + EOL +
    importDeclarations +
    EOL + EOL +
    apiObjDeclaration;

  // create dir if not exists
  await fs.promises.mkdir(path.dirname(apiFilePath), { recursive: true });

  await fs.promises.writeFile(
    apiFilePath, content, { flag: "w+" });
}

