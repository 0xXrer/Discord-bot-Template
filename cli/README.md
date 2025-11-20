# create-discord-bot-oceanic

> CLI to scaffold a modern Discord bot project with Oceanic.js in seconds

[![npm version](https://img.shields.io/npm/v/create-discord-bot-oceanic.svg)](https://www.npmjs.com/package/create-discord-bot-oceanic)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **🚀 Quick Setup** - Create a production-ready Discord bot in one command
- **📦 Multiple Package Managers** - Support for npm, pnpm, yarn, and bun
- **🗃️ Database Options** - Choose from Prisma (PostgreSQL, MySQL, SQLite), Supabase, or none
- **🐳 Docker Ready** - Optional Docker and docker-compose configuration
- **🧩 Modular Architecture** - Select which modules to include in your bot
- **⚡ Modern Stack** - TypeScript, decorators, dependency injection with tsyringe
- **🎨 Type-Safe** - Full TypeScript support with strict mode
- **📝 Auto-Configuration** - Generates .env, .gitignore, and all necessary config files

## Quick Start

### Using npx (recommended)

```bash
npx create-discord-bot-oceanic my-bot
```

### Using npm

```bash
npm create discord-bot-oceanic my-bot
```

### Using pnpm

```bash
pnpm create discord-bot-oceanic my-bot
```

### Using yarn

```bash
yarn create discord-bot-oceanic my-bot
```

### Using bun

```bash
bunx create-discord-bot-oceanic my-bot
```

## Interactive Mode

Simply run the command without arguments to enter interactive mode:

```bash
npx create-discord-bot-oceanic
```

You'll be prompted to configure:

- **Project name** - Name of your bot project
- **Package manager** - npm, pnpm, yarn, or bun
- **Docker** - Include Docker configuration
- **Database** - Choose from:
  - Prisma with PostgreSQL
  - Prisma with MySQL
  - Prisma with SQLite
  - Supabase
  - None
- **Modules** - Select which features to include:
  - General (ping, help, info commands)
  - Moderation (ban, kick, warn commands)
- **Git** - Initialize git repository
- **Install** - Automatically install dependencies

## Command Line Options

```bash
create-discord-bot-oceanic [project-name] [options]
```

### Options

- `-y, --yes` - Skip prompts and use defaults
- `-pm, --package-manager <manager>` - Specify package manager (npm, pnpm, yarn, bun)
- `--no-docker` - Skip Docker configuration
- `--no-install` - Skip automatic dependency installation
- `--no-git` - Skip git initialization

### Examples

**Create with defaults:**
```bash
npx create-discord-bot-oceanic my-bot -y
```

**Create with specific package manager:**
```bash
npx create-discord-bot-oceanic my-bot --package-manager pnpm
```

**Create without Docker:**
```bash
npx create-discord-bot-oceanic my-bot --no-docker
```

**Create and skip installation:**
```bash
npx create-discord-bot-oceanic my-bot --no-install
```

## What's Included

The generated project includes:

### Core Features

- **Oceanic.js** v1.10.2 - Modern Discord API library
- **TypeScript** v5.3.3 - Type-safe development
- **Decorator-based architecture** - Clean command and event system
- **Dependency injection** - Using tsyringe for better modularity
- **Winston logging** - Professional logging system
- **Health monitoring** - Built-in health check endpoints with Prometheus metrics

### Project Structure

```
my-discord-bot/
├── src/
│   ├── core/              # Core framework (decorators, DI, client)
│   ├── modules/           # Feature modules (commands & events)
│   ├── common/            # Shared utilities and builders
│   ├── database/          # Database service
│   ├── config/            # Configuration management
│   └── main.ts            # Application entry point
├── prisma/                # Database schema (if Prisma selected)
├── docker-compose.yml     # Docker orchestration (if Docker selected)
├── Dockerfile             # Container definition (if Docker selected)
├── .env                   # Environment variables
├── package.json
└── tsconfig.json
```

### Available Commands (in generated project)

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

#### Database commands (if Prisma selected)

```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

#### Docker commands (if Docker selected)

```bash
npm run docker:build     # Build Docker image
npm run docker:up        # Start all services
npm run docker:down      # Stop all services
```

## Getting Started After Creation

1. **Navigate to your project:**
   ```bash
   cd my-bot
   ```

2. **Configure environment variables:**
   Edit `.env` and add your Discord bot token:
   ```env
   BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   CLIENT_SECRET=your_client_secret_here
   OWNER_ID=your_discord_user_id
   ```

3. **Set up database (if using Prisma):**
   ```bash
   # Start database with Docker
   docker-compose up -d postgres

   # Run migrations
   npm run prisma:migrate
   ```

4. **Set up Supabase (if using Supabase):**
   - Create a project at https://supabase.com
   - Add credentials to `.env`
   - Apply migrations from `supabase/migrations/` in your Supabase dashboard

5. **Start development:**
   ```bash
   npm run dev
   ```

## Database Options

### Prisma

Supports PostgreSQL, MySQL, and SQLite with a type-safe ORM:

```typescript
import { DatabaseService } from '@database/database.service';

const db = container.resolve(DatabaseService);
const users = await db.client.user.findMany();
```

### Supabase

Includes Supabase client setup and example migrations:

```typescript
import { SupabaseService } from '@database/supabase.service';

const supabase = container.resolve(SupabaseService);
const { data } = await supabase.getClient()
  .from('users')
  .select('*');
```

## Creating Commands

Example command using decorators:

```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown, GuildOnly } from '@core/decorators';
import { ExtendedClient } from '@core/client';

@Command('hello', 'Say hello')
@GuildOnly()
@Cooldown(5000)
@injectable()
export class HelloCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: 'Hello, World!'
    });
  }
}
```

## Creating Events

Example event handler:

```typescript
import { injectable } from 'tsyringe';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';
import { Message } from 'oceanic.js';

@Event('messageCreate', false)
@injectable()
export class MessageCreateEvent extends BaseEvent {
  public async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    this.client.logger.info(`Message: ${message.content}`);
  }
}
```

## Docker Support

The generated project includes Docker configuration with:

- Multi-stage build for optimization
- Database service (PostgreSQL/MySQL) if selected
- Redis for caching
- Health check endpoints
- Production-ready setup

Start all services:
```bash
docker-compose up -d
```

## Requirements

- **Node.js** >= 18.0.0
- **Git** (for cloning the template)
- **Discord Bot Token** - Get one at https://discord.com/developers/applications

## Resources

- [Oceanic.js Documentation](https://docs.oceanic.ws/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 0xXrer

## Support

If you encounter any issues or have questions:
- [Open an issue](https://github.com/0xXrer/Discord-bot-Template/issues)
- Check the [documentation](https://github.com/0xXrer/Discord-bot-Template)

---

**Happy bot building!** 🤖✨
