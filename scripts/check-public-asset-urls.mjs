import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const extensions = new Map([
  ['.ts', ts.ScriptKind.TS],
  ['.tsx', ts.ScriptKind.TSX],
  ['.js', ts.ScriptKind.JS],
  ['.jsx', ts.ScriptKind.JSX],
]);
const publicAssetPath = /^\/(?:art|flags|logos)\//;
const violations = [];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(absolute);
      if (extensions.has(path.extname(entry.name))) return [absolute];
      return [];
    }),
  );
  return nested.flat();
}

function isWithin(node, ancestor) {
  return node.pos >= ancestor.pos && node.end <= ancestor.end;
}

function isInsidePublicUrl(node) {
  for (let current = node; current.parent; current = current.parent) {
    const parent = current.parent;
    if (
      ts.isCallExpression(parent) &&
      ts.isIdentifier(parent.expression) &&
      parent.expression.text === 'publicUrl' &&
      parent.arguments.some((argument) => isWithin(node, argument))
    ) {
      return true;
    }
  }
  return false;
}

function isInRawUniversityManifest(node, sourceFile) {
  if (path.relative(root, sourceFile.fileName) !== path.join('src', 'components', 'ui', 'university-logos.ts')) {
    return false;
  }
  for (let current = node; current; current = current.parent) {
    if (
      ts.isVariableDeclaration(current) &&
      ts.isIdentifier(current.name) &&
      current.name.text === 'RAW_UNIVERSITIES' &&
      current.initializer &&
      isWithin(node, current.initializer)
    ) {
      return true;
    }
  }
  return false;
}

function reportIfUnwrapped(node, value, sourceFile) {
  if (
    !publicAssetPath.test(value) ||
    isInsidePublicUrl(node) ||
    isInRawUniversityManifest(node, sourceFile)
  ) {
    return;
  }
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  violations.push(`${path.relative(root, sourceFile.fileName)}:${line + 1}: ${value}`);
}

for (const file of await sourceFiles(sourceRoot)) {
  if (/\.(?:test|spec)\.[^.]+$/.test(path.basename(file))) continue;
  const text = await readFile(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    extensions.get(path.extname(file)),
  );

  function visit(node) {
    if (ts.isStringLiteralLike(node)) reportIfUnwrapped(node, node.text, sourceFile);
    if (ts.isTemplateExpression(node)) {
      reportIfUnwrapped(node, node.head.text, sourceFile);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

if (violations.length) {
  console.error('Unwrapped root-relative public asset paths found:');
  for (const violation of violations) console.error(`  ${violation}`);
  process.exitCode = 1;
} else {
  console.log('No unwrapped /art/, /flags/, or /logos/ runtime paths found under src/.');
}
