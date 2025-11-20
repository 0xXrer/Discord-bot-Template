export interface ProjectConfig {
  projectName: string;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  useDocker: boolean;
  database: 'prisma-postgres' | 'prisma-mysql' | 'prisma-sqlite' | 'supabase' | 'none';
  includeModules: string[];
  gitInit: boolean;
  installDeps: boolean;
}

export interface TemplateFile {
  path: string;
  content: string;
}

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
