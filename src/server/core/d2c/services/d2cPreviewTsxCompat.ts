import * as ts from "typescript";

const XTARO_ZX_PACKAGE = "@ctrip/xtaro-zx";
const XTARO_ZX_H5_PACKAGE = "@ctrip/xtaro-zx-h5";

const hasUseClientDirective = (sourceFile: ts.SourceFile): boolean => {
  for (const statement of sourceFile.statements) {
    if (!ts.isExpressionStatement(statement)) {
      return false;
    }
    if (!ts.isStringLiteral(statement.expression)) {
      return false;
    }
    if (statement.expression.text === "use client") {
      return true;
    }
  }
  return false;
};

const resolveRewrittenSpecifier = (
  moduleSpecifier: ts.Expression | undefined,
): ts.StringLiteral | undefined => {
  if (!moduleSpecifier) return undefined;
  if (!ts.isStringLiteral(moduleSpecifier)) return undefined;
  if (moduleSpecifier.text !== XTARO_ZX_PACKAGE) return undefined;
  return ts.factory.createStringLiteral(XTARO_ZX_H5_PACKAGE);
};

const rewriteTsxImportsAndExports = (sourceText: string): string => {
  const sourceFile = ts.createSourceFile(
    "index.tsx",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let hasRewrite = false;

  const visit = (context: ts.TransformationContext) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isImportDeclaration(node)) {
        const nextSpecifier = resolveRewrittenSpecifier(node.moduleSpecifier);
        if (!nextSpecifier) {
          return node;
        }
        hasRewrite = true;
        return ts.factory.updateImportDeclaration(
          node,
          node.modifiers,
          node.importClause,
          nextSpecifier,
          node.attributes,
        );
      }

      if (ts.isExportDeclaration(node)) {
        const nextSpecifier = resolveRewrittenSpecifier(node.moduleSpecifier);
        if (!nextSpecifier) {
          return node;
        }
        hasRewrite = true;
        return ts.factory.updateExportDeclaration(
          node,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          nextSpecifier,
          node.attributes,
        );
      }

      return ts.visitEachChild(node, visitor, context);
    };
    return (node: ts.Node) => ts.visitNode(node, visitor);
  };

  const result = ts.transform(sourceFile, [visit]);
  const transformed = result.transformed[0];
  result.dispose();

  if (!hasRewrite || !transformed || !ts.isSourceFile(transformed)) {
    return sourceText;
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printFile(transformed);
};

export const applyPreviewTsxCompat = (sourceText: string): string => {
  const sourceFile = ts.createSourceFile(
    "index.tsx",
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const rewrittenSource = rewriteTsxImportsAndExports(sourceText);
  if (hasUseClientDirective(sourceFile)) {
    return rewrittenSource;
  }

  return `"use client";\n${rewrittenSource}`;
};
