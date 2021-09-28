import fs from "fs";
import path from "path";
import ts from "typescript";
import { EOL } from "os";
import { lint } from "./lint";

const eslintMaxLen = "/* eslint-disable max-len */";

const getFileNameInfo = (filename: string) => {
  const parts = filename.split(".");

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ext = parts.pop()!;

  return [parts.join("."), ext];
};

interface Import {
  schemaName: string;
  relativePath: string;
}


async function getApiObject(
  rootDir: string, relativePath: string, imports: Import[],
): Promise<ts.ObjectLiteralExpression> {

  const subObjects = [] as ts.ObjectLiteralElementLike[];

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

        const schemaName = interfaceName.slice(0, interfaceName.length - "Schema".length);

        const propertyName = schemaName[0].toLocaleLowerCase() + schemaName.slice(1);

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
          schemaName: interfaceName,
          relativePath: relativePath + "/" + filename,
        });

        subObjects.push(ts.factory.createPropertyAssignment(
          propertyName,
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("fromApi"),
            [
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(interfaceName),
                undefined
              ),
            ],
            [
              ts.factory.createStringLiteral(methodName),
              ts.factory.createStringLiteral("/api/" + relativePath + "/" + filename),
            ],
          ),
        ));
      }
    } else {
      const apiObject = await getApiObject(p, path.join(relativePath, f), imports);

      // ignore empty object
      let count = 0;
      apiObject.forEachChild(() => count++);
      if (count > 0) {
        subObjects.push(ts.factory.createPropertyAssignment(
          f, apiObject,
        ));
      }
    }
  }

  return ts.factory.createObjectLiteralExpression(subObjects, true);

}

export interface GenerateApiClientsArgs {
  apiFilePath?: string;
  apiRoutesPath?: string;
  fetchImport?: string;
  eslintCwd?: string;
}

export async function generateClients({
  apiFilePath = "src/apis/api.ts",
  apiRoutesPath = "src/pages/api",
  fetchImport = "next-typed-api-routes",
  eslintCwd = process.cwd(),
}: GenerateApiClientsArgs) {

  if (!apiRoutesPath.endsWith("/")) {
    apiRoutesPath += "/";
  }

  const imports = [] as Import[];
  const apiObject = await getApiObject(apiRoutesPath, "", imports);

  const apiObjDeclaration = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([

      ts.factory.createVariableDeclaration(
        "realApi",
        undefined,
        undefined,
        apiObject,
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

  const importDeclarations = imports.map(({ relativePath, schemaName }) => (
    ts.factory.createImportDeclaration(
      undefined,
      undefined,
      ts.factory.createImportClause(
        true,
        undefined,
        ts.factory.createNamedImports([ts.factory.createImportSpecifier(
          undefined,
          ts.factory.createIdentifier(schemaName)
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

  // lint the content using cwd
  const result = await lint(eslintCwd, content);

  await fs.promises.writeFile(
    apiFilePath, result, { flag: "w+" });
}

