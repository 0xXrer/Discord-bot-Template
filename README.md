# Discord Bot Template v2.0

[![CI](https://github.com/0xXrer/Discord-bot-Template/workflows/CI/badge.svg)](https://github.com/0xXrer/Discord-bot-Template/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)

A modern, production-ready Discord bot template built with **TypeScript**, **Oceanic.js**, featuring **decorators**, **dependency injection**, and a **modular architecture**.

## ✨ Features

- 🎨 **Modern Architecture** - Built with decorators, DI container (tsyringe), and modular design
- 🔧 **Type-Safe** - Full TypeScript with strict mode enabled
- 🗃️ **Database Integration** - Prisma ORM with PostgreSQL support
- 📊 **Monitoring** - Built-in health checks, metrics (Prometheus), and logging (Winston)
- 🚀 **Production Ready** - Docker support, CI/CD with GitHub Actions
- 🧪 **Fully Tested** - Comprehensive test suite with Jest
- 🎯 **User Installable** - Supports both guild and user-installed applications
- 🔄 **Hot Reload** - Fast development with automatic reloading
- 📦 **Modular** - Easy to extend with custom modules and commands

## 📋 Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** (optional, for database features)
- **Docker** (optional, for containerization)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/0xXrer/Discord-bot-Template.git
cd Discord-bot-Template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and add your Discord bot credentials:

```env
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
OWNER_ID=your_discord_user_id_here
```

### 4. Set up the database (optional)

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### 5. Run the bot

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## 🏗️ Architecture

### Project Structure

```
Discord-bot-Template/
├── src/
│   ├── core/                    # Core system
│   │   ├── decorators/          # Command, Event, Middleware decorators
│   │   ├── container/           # DI container (tsyringe)
│   │   ├── client/              # Extended Discord client
│   │   ├── base/                # Base classes
│   │   └── interfaces/          # TypeScript interfaces
│   ├── modules/                 # Feature modules
│   │   ├── general/             # General commands (ping, help, info)
│   │   └── moderation/          # Moderation commands (ban, kick, warn)
│   ├── common/                  # Shared utilities
│   │   ├── builders/            # EmbedBuilder, ComponentBuilder
│   │   ├── middleware/          # RateLimit, Permission middleware
│   │   ├── logger/              # Winston logging
│   │   └── utils/               # Utility functions
│   ├── database/                # Prisma database service
│   ├── config/                  # Configuration with validation
│   ├── health/                  # Health checks & metrics
│   └── main.ts                  # Application entry point
├── prisma/                      # Database schema
├── .github/workflows/           # CI/CD pipelines
└── docker-compose.yml           # Docker orchestration
```

### Creating Commands with Decorators

```typescript
import { CommandInteraction } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, RequirePermissions, Cooldown, GuildOnly } from '@core/decorators';
import { EmbedBuilder } from '@common/builders';

@Command('example', 'An example command')
@RequirePermissions('MANAGE_MESSAGES')
@GuildOnly()
@Cooldown(5000)
export class ExampleCommand extends BaseCommand {
  public async execute(interaction: CommandInteraction): Promise<void> {
    const embed = EmbedBuilder.success('Success!', 'Command executed')
      .setTimestamp()
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

### Creating Modules

```typescript
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';

export class MyModule extends BaseModule {
  public name = 'MyModule';

  public async initialize(client: ExtendedClient): Promise<void> {
    // Register commands and events
    client.registerCommand(new MyCommand(client));
    client.registerEvent(new MyEvent(client));
  }
}
```

## 🎯 Available Commands

### General Module
- `/ping` - Check bot latency and response time
- `/help` - Display all available commands
- `/info` - Show bot information and statistics

### Moderation Module
- `/ban <user> [reason]` - Ban a user from the server
- `/kick <user> [reason]` - Kick a user from the server
- `/warn <user> <reason>` - Warn a user and log to database

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f bot

# Stop services
docker-compose down
```

This starts:
- Discord Bot
- PostgreSQL database
- Redis cache
- Prometheus metrics
- Grafana dashboard (http://localhost:3001)

### Using Docker Only

```bash
# Build image
docker build -t discord-bot .

# Run container
docker run -d \
  --name discord-bot \
  --env-file .env \
  -p 3000:3000 \
  discord-bot
```

## 📊 Monitoring

The bot includes built-in monitoring endpoints:

- **Health Check**: `http://localhost:3000/health`
- **Readiness**: `http://localhost:3000/ready`
- **Metrics**: `http://localhost:3000/metrics` (Prometheus format)
- **Stats**: `http://localhost:3000/stats` (JSON statistics)

### Grafana Dashboard

Access Grafana at `http://localhost:3001` (admin/admin) to visualize metrics.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🛠️ Development

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Database Management

```bash
# Create a new migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Generate Prisma client
npm run prisma:generate
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run prisma:migrate` | Run database migrations |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker containers |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Oceanic.js](https://github.com/OceanicJS/Oceanic) - Discord API library
- [tsyringe](https://github.com/microsoft/tsyringe) - Dependency injection
- [Prisma](https://www.prisma.io/) - Database ORM
- [Winston](https://github.com/winstonjs/winston) - Logging library

## 📧 Support

For support, please open an issue on [GitHub](https://github.com/0xXrer/Discord-bot-Template/issues).

---

Made with ❤️ by [0xXrer](https://github.com/0xXrer)
