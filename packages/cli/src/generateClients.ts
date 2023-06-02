import fs from "fs";
import { EOL } from "os";
import path from "path";
import ts from "typescript";

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

export const ApiTypes = {
  zod: { libImport: "fromZodRoute", typeFormat: (typeName: string) => `typeof ${typeName}` },
  typebox: { libImport: "fromTypeboxRoute", typeFormat: (typeName: string) => `typeof ${typeName}` },
  static: { libImport: "fromStaticRoute", typeFormat: (typeName: string) => typeName },
};

export type ApiType = keyof typeof ApiTypes;

interface Endpoint {
  functionName: string;
  importName: string;
  type: ApiType;
  method: string;
  path: string;
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

        let found: { typeName: string; method: string; apiType: ApiType } | undefined = undefined;

        for (const statement of sourceFile.statements) {

          if (ts.isVariableStatement(statement)) {
            const declaration = statement.declarationList.declarations[0];

            if (ts.isIdentifier(declaration.name)
              && declaration.name.text.endsWith("Schema") && declaration.name.text.length > "Schema".length
              && declaration.initializer && ts.isCallExpression(declaration.initializer)
              && ts.isIdentifier(declaration.initializer.expression)
              && ts.isObjectLiteralExpression(declaration.initializer.arguments[0])
            ) {

              const schemaFunction = declaration.initializer.expression.text;

              // zodRouteSchema or typeboxRouteSchema
              const schema = declaration.initializer.arguments[0];

              for (const property of schema.properties) {

                if (ts.isPropertyAssignment(property) &&
                  property.name && ts.isIdentifier(property.name)
                  && property.name.escapedText === "method"
                  && ts.isStringLiteral(property.initializer)
                ) {
                  found = {
                    apiType: schemaFunction === "zodRouteSchema" ? "zod" : "typebox",
                    typeName: declaration.name.text,
                    method: property.initializer.text,
                  };

                  break;
                }
              }
            }
          }

          if (found) {
            break;
          }


          if (ts.isInterfaceDeclaration(statement)
              && statement.name.text.endsWith("Schema") && statement.name.text.length > "Schema".length) {

            const interfaceName = statement.name.text;

            // Get method from method property
            for (const s of statement.members) {
              if (ts.isPropertySignature(s) &&
                    ts.isIdentifier(s.name) && s.name.text === "method" &&
                    s.type && ts.isLiteralTypeNode(s.type) && ts.isStringLiteral(s.type.literal)
              ) {

                found = {
                  typeName: interfaceName,
                  method: s.type.literal.text,
                  apiType: "static",
                };

                break;
              }
            }

          }
        }

        if (!found) { continue; }
        // Get URL from file path
        imports.push({
          interfaceName: found.typeName,
          relativePath: relativePath + "/" + filename,
        });

        // LoginSchema -> login
        const functionName = found.typeName[0].toLocaleLowerCase()
        + found.typeName.substring(1, found.typeName.length - "Schema".length);

        endpoints.push({
          method: found.method,
          importName: found.typeName,
          functionName,
          type: found.apiType,
          path: "/api/" + relativePath + (filename === "index" ? "" : ("/" + filename)),
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
  clientObjectName: string;
  clientObjectImportPath: string;
  apiObjectName?: string;
}

export async function generateClients({
  apiFilePath = "src/apis/api.ts",
  apiRoutesPath = "src/pages/api",
  clientObjectName,
  clientObjectImportPath,
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
${endpoints.map((e) => {

    const { libImport, typeFormat } = ApiTypes[e.type];
    return (
      `  ${e.functionName}: ${clientObjectName}.${libImport}<${typeFormat(e.importName)}>` +
      `("${e.method}", "${e.path}"),`
    );
  },
  ).join(EOL)}
};
  `;

  const fetchApiImportDeclaration = `
import { ${clientObjectName} } from "${clientObjectImportPath}";
`;

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

