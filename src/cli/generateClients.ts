import fs from "fs";
import path from "path";
import ts from "typescript";
import { EOL } from "os";

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
          url: "/api/" + relativePath + "/" + filename,
        });

        // subObjects.push(ts.factory.createPropertyAssignment(
        //   ts.factory.createStringLiteral(propertyName),
        //   ts.factory.createCallExpression(
        //     ts.factory.createIdentifier("fromApi"),
        //     [
        //       ts.factory.createTypeReferenceNode(
        //         ts.factory.createIdentifier(interfaceName),
        //         undefined
        //       ),
        //     ],
        //     [
        //       ts.factory.createStringLiteral(methodName),
        //       ts.factory.createStringLiteral("/api/" + relativePath + "/" + filename),
        //     ],
        //   ),
        // ));
      }
    } else {
      await getApiObject(p, path.join(relativePath, f), endpoints, imports);

      // ignore empty object
      // let count = 0;
      // apiObject.forEachChild(() => count++);
      // if (count > 0) {
      //   subObjects.push(ts.factory.createPropertyAssignment(
      //     ts.factory.createStringLiteral(f), apiObject,
      //   ));
      // }
    }
  }

  // return ts.factory.createObjectLiteralExpression(subObjects, true);
}

export interface GenerateApiClientsArgs {
  apiFilePath?: string;
  apiRoutesPath?: string;
  fetchImport?: string;
}

export async function generateClients({
  apiFilePath = "src/apis/api.ts",
  apiRoutesPath = "src/pages/api",
  fetchImport = "next-typed-api-routes",
}: GenerateApiClientsArgs) {

  if (!apiRoutesPath.endsWith("/")) {
    apiRoutesPath += "/";
  }

  const imports = [] as Import[];
  const endpoints = [] as Endpoint[];

  await getApiObject(apiRoutesPath, "", endpoints, imports);

  const apiObjDeclaration = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([
      ts.factory.createVariableDeclaration(
        "realApi",
        undefined,
        undefined,
        ts.factory.createObjectLiteralExpression(endpoints.map((e) => (
          ts.factory.createPropertyAssignment(
            ts.factory.createStringLiteral(e.schemaName),
            ts.factory.createCallExpression(
              ts.factory.createIdentifier("fromApi"),
              [
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier(e.interfaceName),
                  undefined
                ),
              ],
              [
                ts.factory.createStringLiteral(e.method),
                ts.factory.createStringLiteral(e.url),
              ],
            ),
          )))
        ),
      ),
    ], ts.NodeFlags.Const),
  );

  const fetchApiImportDeclaration = ts.factory.createImportDeclaration([], [],
    ts.factory.createImportClause(false, undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          undefined,
          ts.factory.createIdentifier("fromApi")
        ),
      ]),
    ),
    ts.factory.createStringLiteral(fetchImport),
  );

  const importDeclarations = imports.map(({ relativePath, interfaceName }) => (
    ts.factory.createImportDeclaration(
      undefined,
      undefined,
      ts.factory.createImportClause(
        true,
        undefined,
        ts.factory.createNamedImports([ts.factory.createImportSpecifier(
          undefined,
          ts.factory.createIdentifier(interfaceName)
        )])
      ),
      ts.factory.createStringLiteral(apiRoutesPath + relativePath)
    )
  ));

  const printer = ts.createPrinter();

  const dummySourceFile = ts.createSourceFile(apiFilePath, "", ts.ScriptTarget.Latest);

  function getString(node: ts.Node) {
    return printer.printNode(
      ts.EmitHint.Unspecified,
      node,
      dummySourceFile);
  }

  const content =
    eslintMaxLen +
    EOL +
    getString(fetchApiImportDeclaration) +
    EOL + EOL +
    importDeclarations.map(getString).join(EOL) +
    EOL + EOL +
    getString(apiObjDeclaration);

  // create dir if not exists
  await fs.promises.mkdir(path.dirname(apiFilePath), { recursive: true });

  await fs.promises.writeFile(
    apiFilePath, content, { flag: "w+" });
}

