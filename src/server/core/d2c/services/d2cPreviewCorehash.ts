import { createHash } from "node:crypto";
import * as ts from "typescript";

export interface CorehashInfo {
  filename: string;
  fileDir: string;
  line: number;
  endLine: number;
  nodeCode: string;
  nodeStartLine: number;
  nodeEndLine: number;
}

export interface CorehashInjectionResult {
  injectedCode: string;
  corehashMap: Record<string, string>;
}

export const serializeCorehashMap = (
  corehashMap: Record<string, string>,
): string => JSON.stringify(corehashMap, null, 2);

const isDataCorehashAttribute = (attr: ts.JsxAttributeLike): boolean => {
  if (!ts.isJsxAttribute(attr)) return false;
  const name = attr.name;
  return ts.isIdentifier(name) && name.text === "data-corehash";
};

const readExistingCorehash = (attrs: ts.JsxAttributes): string | undefined => {
  for (const attr of attrs.properties) {
    if (!isDataCorehashAttribute(attr)) continue;
    if (!ts.isJsxAttribute(attr)) continue;
    const initializer = attr.initializer;
    if (!initializer || !ts.isStringLiteral(initializer)) continue;
    return initializer.text;
  }
  return undefined;
};

const createCorehash = (seed: string, index: number): string => {
  const hash = createHash("sha1");
  hash.update(`${seed}#${index}`);
  return hash.digest("hex").slice(0, 8);
};

export const buildCorehashInjection = (params: {
  sourceText: string;
  fileDir: string;
  filename: string;
}): CorehashInjectionResult => {
  const sourceFile = ts.createSourceFile(
    params.filename,
    params.sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const corehashMap = new Map<string, CorehashInfo>();
  let seedIndex = 0;

  const buildInfo = (node: ts.Node, _corehash: string): CorehashInfo => {
    const startPos = node.getStart(sourceFile);
    const endPos = node.getEnd();
    const startLine =
      sourceFile.getLineAndCharacterOfPosition(startPos).line + 1;
    const endLine = sourceFile.getLineAndCharacterOfPosition(endPos).line + 1;
    const nodeCode = node.getText(sourceFile);
    return {
      filename: params.filename,
      fileDir: params.fileDir,
      line: startLine,
      endLine,
      nodeCode,
      nodeStartLine: startLine,
      nodeEndLine: endLine,
    };
  };

  const registerCorehash = (node: ts.Node, corehash: string) => {
    if (!corehashMap.has(corehash)) {
      corehashMap.set(corehash, buildInfo(node, corehash));
      return corehash;
    }
    seedIndex += 1;
    const fallback = createCorehash(`${corehash}#${node.pos}`, seedIndex);
    if (!corehashMap.has(fallback)) {
      corehashMap.set(fallback, buildInfo(node, fallback));
      return fallback;
    }
    seedIndex += 1;
    const secondFallback = createCorehash(`${corehash}#${node.end}`, seedIndex);
    corehashMap.set(secondFallback, buildInfo(node, secondFallback));
    return secondFallback;
  };

  const addCorehashAttribute = (
    attrs: ts.JsxAttributes,
    corehash: string,
  ): ts.JsxAttributes => {
    if (readExistingCorehash(attrs)) return attrs;
    const newAttr = ts.factory.createJsxAttribute(
      ts.factory.createIdentifier("data-corehash"),
      ts.factory.createStringLiteral(corehash),
    );
    return ts.factory.createJsxAttributes([...attrs.properties, newAttr]);
  };

  const visit = (context: ts.TransformationContext) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isJsxElement(node)) {
        const attrs = node.openingElement.attributes;
        const existing = readExistingCorehash(attrs);
        const seed = `${params.fileDir}:${node.pos}:${node.end}`;
        const corehash = registerCorehash(
          node,
          existing ?? createCorehash(seed, seedIndex),
        );
        const nextAttrs = addCorehashAttribute(attrs, corehash);
        const updatedNode =
          nextAttrs !== attrs
            ? ts.factory.updateJsxElement(
                node,
                ts.factory.updateJsxOpeningElement(
                  node.openingElement,
                  node.openingElement.tagName,
                  node.openingElement.typeArguments,
                  nextAttrs,
                ),
                node.children,
                node.closingElement,
              )
            : node;
        return ts.visitEachChild(updatedNode, visitor, context);
      }
      if (ts.isJsxSelfClosingElement(node)) {
        const attrs = node.attributes;
        const existing = readExistingCorehash(attrs);
        const seed = `${params.fileDir}:${node.pos}:${node.end}`;
        const corehash = registerCorehash(
          node,
          existing ?? createCorehash(seed, seedIndex),
        );
        const nextAttrs = addCorehashAttribute(attrs, corehash);
        if (nextAttrs !== attrs) {
          return ts.factory.updateJsxSelfClosingElement(
            node,
            node.tagName,
            node.typeArguments,
            nextAttrs,
          );
        }
        return node;
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return (node: ts.Node) => ts.visitNode(node, visitor);
  };

  const result = ts.transform(sourceFile, [visit]);
  const transformed = result.transformed[0];
  result.dispose();

  if (!transformed || !ts.isSourceFile(transformed)) {
    return {
      injectedCode: params.sourceText,
      corehashMap: {},
    };
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const injectedCode = printer.printFile(transformed);

  const corehashMapRecord: Record<string, string> = {};
  for (const [key, value] of corehashMap.entries()) {
    corehashMapRecord[key] = JSON.stringify(value);
  }

  return {
    injectedCode,
    corehashMap: corehashMapRecord,
  };
};
