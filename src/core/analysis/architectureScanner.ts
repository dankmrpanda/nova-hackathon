import fs from 'fs';
import path from 'path';
import { Project, ScriptTarget, ModuleKind } from 'ts-morph';

export type FileSummary = {
  path: string;
  imports: string[];
  exports: string[];
  kind: 'ts' | 'js' | 'other';
};

export type ArchitectureSummary = {
  root: string;
  languages: string[];
  packages?: {
    name?: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  modules: Array<{
    name: string;
    files: string[];
  }>;
  files: FileSummary[];
  entrypoints: string[];
};

const isTs = (p: string) => p.endsWith('.ts') || p.endsWith('.tsx');
const isJs = (p: string) => p.endsWith('.js') || p.endsWith('.jsx');

function walk(dir: string, ignore: RegExp[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (ignore.some((r) => r.test(full))) continue;
    if (e.isDirectory()) files.push(...walk(full, ignore));
    else files.push(full);
  }
  return files;
}

function readJson<T = unknown>(p: string): T | undefined {
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export async function scanWorkspace(root: string): Promise<ArchitectureSummary> {
  const ignore = [/node_modules/, /dist/, /.git/];
  const allFiles = fs.existsSync(root) ? walk(root, ignore) : [];

  const pkgPath = path.join(root, 'package.json');
  const pkg = readJson<any>(pkgPath);

  // Determine languages present
  const languages = Array.from(
    new Set(
      allFiles.map((f) => (isTs(f) ? 'ts' : isJs(f) ? 'js' : path.extname(f).slice(1) || 'other'))
    )
  );

  // Load a ts-morph project best-effort
  const tsconfigPath = fs.existsSync(path.join(root, 'tsconfig.json'))
    ? path.join(root, 'tsconfig.json')
    : undefined;
  const project = new Project(
    tsconfigPath
      ? { tsConfigFilePath: tsconfigPath, skipAddingFilesFromTsConfig: false }
      : { compilerOptions: { target: ScriptTarget.ES2020, module: ModuleKind.CommonJS } }
  );

  if (!tsconfigPath) {
    const tsJsFiles = allFiles.filter((f) => isTs(f) || isJs(f));
    project.addSourceFilesAtPaths(tsJsFiles);
  }

  const fileSummaries: FileSummary[] = [];
  for (const sf of project.getSourceFiles()) {
    const filePath = sf.getFilePath();
    const imports = sf.getImportDeclarations().map((i) => i.getModuleSpecifierValue());
    const exports = sf.getExportedDeclarations().keys();
    fileSummaries.push({
      path: filePath,
      imports,
      exports: Array.from(exports),
      kind: isTs(filePath) ? 'ts' : isJs(filePath) ? 'js' : 'other',
    });
  }

  // Entry points: scripts.start or bin or src/index.ts/js
  const entrypoints = [
    ...(pkg?.bin ? Object.values(pkg.bin as Record<string, string>) : []),
    ...(pkg?.main ? [pkg.main as string] : []),
  ]
    .map((p) => path.resolve(root, p))
    .filter((p) => fs.existsSync(p));
  const defaultEntrypoints = ['src/index.ts', 'src/index.js']
    .map((p) => path.resolve(root, p))
    .filter((p) => fs.existsSync(p));

  // Modules by top-level folder under src
  const srcDir = path.join(root, 'src');
  const modules: ArchitectureSummary['modules'] = [];
  if (fs.existsSync(srcDir)) {
    for (const name of fs.readdirSync(srcDir)) {
      const full = path.join(srcDir, name);
      if (fs.statSync(full).isDirectory()) {
        const files = walk(full, ignore).filter((f) => isTs(f) || isJs(f));
        modules.push({ name, files });
      }
    }
  }

  return {
    root: path.resolve(root),
    languages,
    packages: pkg
      ? {
          name: pkg.name,
          scripts: pkg.scripts,
          dependencies: pkg.dependencies,
          devDependencies: pkg.devDependencies,
        }
      : undefined,
    modules,
    files: fileSummaries,
    entrypoints: [...new Set([...entrypoints, ...defaultEntrypoints])],
  };
}
