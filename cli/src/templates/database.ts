import fs from 'fs-extra';
import path from 'path';
import type { ProjectConfig } from '../types';

export class DatabaseTemplate {
  constructor(private projectPath: string, private config: ProjectConfig) {}

  async setup(): Promise<void> {
    if (this.config.database === 'none') {
      await this.removeDatabase();
    } else if (this.config.database.startsWith('prisma')) {
      await this.setupPrisma();
    } else if (this.config.database === 'supabase') {
      await this.setupSupabase();
    }
  }

  private async removeDatabase(): Promise<void> {
    // Remove Prisma folder
    await fs.remove(path.join(this.projectPath, 'prisma'));

    // Remove database service
    await fs.remove(path.join(this.projectPath, 'src/database'));
  }

  private async setupPrisma(): Promise<void> {
    const prismaSchemaPath = path.join(this.projectPath, 'prisma/schema.prisma');

    let datasourceProvider = 'postgresql';
    if (this.config.database === 'prisma-mysql') {
      datasourceProvider = 'mysql';
    } else if (this.config.database === 'prisma-sqlite') {
      datasourceProvider = 'sqlite';
    }

    const schemaContent = `// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${datasourceProvider}"
  url      = env("DATABASE_URL")
}

// Example model - customize as needed
model User {
  id        String   @id @default(cuid())
  discordId String   @unique
  username  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Guild {
  id        String   @id @default(cuid())
  guildId   String   @unique
  name      String
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("guilds")
}
`;

    await fs.writeFile(prismaSchemaPath, schemaContent);
  }

  private async setupSupabase(): Promise<void> {
    // Remove Prisma
    await fs.remove(path.join(this.projectPath, 'prisma'));

    // Create Supabase service
    const supabaseServicePath = path.join(this.projectPath, 'src/database/supabase.service.ts');

    const supabaseServiceContent = `import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { singleton } from 'tsyringe';
import { Logger } from '@common/logger';
import { Config } from '@config/Config';

@singleton()
export class SupabaseService {
  private client: SupabaseClient | null = null;
  private connected = false;

  constructor(
    private logger: Logger,
    private config: Config
  ) {}

  async connect(): Promise<void> {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not found in environment variables');
      }

      this.client = createClient(supabaseUrl, supabaseKey);
      this.connected = true;

      this.logger.info('Connected to Supabase');
    } catch (error) {
      this.logger.error('Failed to connect to Supabase:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      // Supabase client doesn't need explicit disconnection
      this.client = null;
      this.connected = false;
      this.logger.info('Disconnected from Supabase');
    }
  }

  getClient(): SupabaseClient {
    if (!this.client || !this.connected) {
      throw new Error('Supabase client not connected. Call connect() first.');
    }
    return this.client;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
`;

    await fs.ensureDir(path.dirname(supabaseServicePath));
    await fs.writeFile(supabaseServicePath, supabaseServiceContent);

    // Update index.ts
    const indexPath = path.join(this.projectPath, 'src/database/index.ts');
    const indexContent = `export { SupabaseService } from './supabase.service';
`;
    await fs.writeFile(indexPath, indexContent);

    // Create SQL migration example
    const migrationsDir = path.join(this.projectPath, 'supabase/migrations');
    await fs.ensureDir(migrationsDir);

    const initialMigration = `-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);
CREATE INDEX IF NOT EXISTS idx_guilds_guild_id ON guilds(guild_id);
`;

    await fs.writeFile(
      path.join(migrationsDir, '00001_initial_schema.sql'),
      initialMigration
    );

    // Create README for Supabase setup
    const readmePath = path.join(this.projectPath, 'supabase/README.md');
    const readmeContent = `# Supabase Setup

## Getting Started

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key to \`.env\`:
   \`\`\`
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   \`\`\`

3. Run migrations in your Supabase SQL Editor or using the CLI

## Migrations

Apply the migration files in \`supabase/migrations/\` in your Supabase dashboard:
- Go to your project → SQL Editor
- Copy and paste the SQL from the migration files
- Execute them in order

## Using Supabase in Your Code

\`\`\`typescript
import { SupabaseService } from '@database/supabase.service';

// In your command or service
const supabase = container.resolve(SupabaseService);
const client = supabase.getClient();

// Query example
const { data, error } = await client
  .from('users')
  .select('*')
  .eq('discord_id', userId);
\`\`\`

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
`;

    await fs.writeFile(readmePath, readmeContent);
  }
}
