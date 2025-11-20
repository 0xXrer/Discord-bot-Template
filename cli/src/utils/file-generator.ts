import fs from 'fs-extra';
import path from 'path';
import type { ProjectConfig } from '../types';

export class FileGenerator {
  constructor(private projectPath: string, private config: ProjectConfig) {}

  async generateEnvFile(): Promise<void> {
    const envContent = `# Discord Bot Configuration
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here

# Bot Owner
OWNER_ID=your_discord_user_id

# Environment
NODE_ENV=development
LOG_LEVEL=debug

# Database
${this.getDatabaseEnvVars()}

# Optional: Redis Cache
# REDIS_URL=redis://localhost:6379

# Optional: Sharding
SHARDS=1

# Health Check Server
PORT=3000

# Rate Limiting
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MS=60000
`;

    await fs.writeFile(path.join(this.projectPath, '.env'), envContent);
    await fs.writeFile(
      path.join(this.projectPath, '.env.example'),
      envContent.replace(/=.+/g, '=')
    );
  }

  private getDatabaseEnvVars(): string {
    switch (this.config.database) {
      case 'prisma-postgres':
        return 'DATABASE_URL=postgresql://user:password@localhost:5432/discord_bot?schema=public';
      case 'prisma-mysql':
        return 'DATABASE_URL=mysql://user:password@localhost:3306/discord_bot';
      case 'prisma-sqlite':
        return 'DATABASE_URL=file:./dev.db';
      case 'supabase':
        return `SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key`;
      default:
        return '# No database configured';
    }
  }

  async updatePackageJson(): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);

    // Update basic info
    packageJson.name = this.config.projectName;
    packageJson.version = '1.0.0';
    packageJson.description = `Discord bot built with Oceanic.js`;
    packageJson.author = '';

    // Remove CLI-related scripts if they exist
    delete packageJson.scripts?.['cli:build'];
    delete packageJson.scripts?.['cli:dev'];

    // Update dependencies based on database choice
    if (this.config.database === 'none') {
      delete packageJson.dependencies['@prisma/client'];
      delete packageJson.devDependencies['prisma'];
      delete packageJson.scripts['prisma:generate'];
      delete packageJson.scripts['prisma:migrate'];
      delete packageJson.scripts['prisma:studio'];
    } else if (this.config.database === 'supabase') {
      delete packageJson.dependencies['@prisma/client'];
      delete packageJson.devDependencies['prisma'];
      delete packageJson.scripts['prisma:generate'];
      delete packageJson.scripts['prisma:migrate'];
      delete packageJson.scripts['prisma:studio'];

      packageJson.dependencies['@supabase/supabase-js'] = '^2.39.0';
    }

    // Remove Docker scripts if not using Docker
    if (!this.config.useDocker) {
      delete packageJson.scripts['docker:build'];
      delete packageJson.scripts['docker:up'];
      delete packageJson.scripts['docker:down'];
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  async generateGitignore(): Promise<void> {
    const gitignoreContent = `# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb

# Build output
dist/
build/

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Prisma
${this.config.database.startsWith('prisma') ? 'prisma/migrations/' : ''}
${this.config.database === 'prisma-sqlite' ? '*.db\n*.db-journal' : ''}

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
temp/
tmp/
`;

    await fs.writeFile(path.join(this.projectPath, '.gitignore'), gitignoreContent);
  }
}
