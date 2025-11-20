# Quick Start Guide

## Installation & Usage

### Option 1: Using npx (No Installation Required)

```bash
npx create-discord-bot-oceanic my-awesome-bot
cd my-awesome-bot
```

### Option 2: Interactive Mode

```bash
npx create-discord-bot-oceanic
```

You'll be asked to choose:
1. **Project name** (e.g., `my-discord-bot`)
2. **Package manager** (npm, pnpm, yarn, bun)
3. **Docker support** (yes/no)
4. **Database** (Prisma PostgreSQL/MySQL/SQLite, Supabase, or none)
5. **Modules** (General, Moderation, or both)
6. **Git initialization** (yes/no)
7. **Auto-install dependencies** (yes/no)

### Option 3: Command Line Arguments

```bash
# Use defaults
npx create-discord-bot-oceanic my-bot -y

# Custom package manager
npx create-discord-bot-oceanic my-bot -pm pnpm

# Skip Docker
npx create-discord-bot-oceanic my-bot --no-docker

# Skip installation
npx create-discord-bot-oceanic my-bot --no-install
```

## After Creation

### 1. Configure Your Bot

Edit `.env` file:
```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
OWNER_ID=your_discord_user_id
```

Get your bot token from [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Set Up Database (if selected)

#### With Prisma + PostgreSQL/MySQL:
```bash
# Start database
docker-compose up -d postgres  # or mysql

# Run migrations
npm run prisma:migrate

# Generate Prisma client (if not auto-installed)
npm run prisma:generate
```

#### With Supabase:
1. Create a project at https://supabase.com
2. Add credentials to `.env`
3. Run migrations from `supabase/migrations/` in Supabase dashboard

### 3. Start Development

```bash
npm run dev
```

Your bot is now running! 🎉

## Common Commands

```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run lint         # Lint code
npm run format       # Format with Prettier
```

## Creating Your First Command

1. Create a file in `src/modules/general/commands/MyCommand.ts`:

```typescript
import 'reflect-metadata';
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command } from '@core/decorators';
import { ExtendedClient } from '@core/client';

@Command('hello', 'Say hello to the bot')
@injectable()
export class HelloCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: `Hello, ${interaction.user.username}!`
    });
  }
}
```

2. Register in `src/modules/general/general.module.ts`:

```typescript
import { HelloCommand } from './commands/HelloCommand';

public async initialize(client: ExtendedClient): Promise<void> {
  const commands = [
    Container.get<HelloCommand>(HelloCommand),
    // ... other commands
  ];

  commands.forEach((command) => client.registerCommand(command));
}
```

3. Restart the bot - commands are registered automatically!

## Deploying to Production

### With Docker:

```bash
# Build image
npm run docker:build

# Start all services
npm run docker:up

# View logs
docker-compose logs -f bot

# Stop services
npm run docker:down
```

### Without Docker:

```bash
# Build
npm run build

# Set production environment
export NODE_ENV=production

# Start
npm start
```

## Need Help?

- [Full Documentation](./README.md)
- [Publishing Guide](./PUBLISHING.md)
- [Oceanic.js Docs](https://docs.oceanic.ws/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Report Issues](https://github.com/0xXrer/Discord-bot-Template/issues)

## What's Included?

- ✅ TypeScript with strict mode
- ✅ Decorator-based commands
- ✅ Dependency injection
- ✅ Module architecture
- ✅ Database integration
- ✅ Docker support
- ✅ Health monitoring
- ✅ Logging with Winston
- ✅ Testing with Jest
- ✅ Code formatting with Prettier
- ✅ Linting with ESLint

Happy coding! 🚀
