# Getting Started with BOTMINE

This guide will help you set up and run the BOTMINE Discord bot on your system.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A Discord application and bot token

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BOTMINE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp exemple.env .env
```

Edit `.env` with your bot credentials:

```env
# Discord Bot Configuration
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
OWNER_ID=your_user_id_here

# Environment
NODE_ENV=development

# Database (optional)
DATABASE_URL=your_database_url_here

# Logging
LOG_LEVEL=info
```

### 4. Build the Project

```bash
npm run build
```

### 5. Start the Bot

For production:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Discord Bot Setup

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your bot a name
4. Go to the "Bot" section
5. Click "Add Bot"
6. Copy the bot token to your `.env` file

### 2. Configure Bot Permissions

In the Discord Developer Portal:
1. Go to OAuth2 > URL Generator
2. Select "bot" and "applications.commands" scopes
3. Select necessary permissions:
   - Send Messages
   - Use Slash Commands
   - Embed Links
   - Read Message History

### 3. Invite the Bot

Use the generated URL to invite your bot to your server.

## Development

### Project Structure

```
src/
├── client/          # BotClient class and core functionality
├── commands/        # Slash command implementations
│   ├── BaseCommand.ts    # Base command class
│   ├── Help.ts           # Help command
│   ├── Ping.ts           # Ping command
│   └── UserInfo.ts       # User info command
├── events/          # Discord event handlers
│   ├── BaseEvent.ts      # Base event class
│   ├── Ready.ts          # Bot ready event
│   ├── InteractionCreate.ts # Command interaction event
│   └── Error.ts          # Error handling event
├── handlers/        # Command and event management
│   ├── CommandHandler.ts # Command loading and execution
│   └── EventHandler.ts   # Event registration
├── managers/        # Bot managers
│   └── PermissionManager.ts # Permission system
├── utils/           # Utility functions
│   ├── Logger.ts         # Logging system
│   └── FileUtils.ts      # File operations
├── config/          # Configuration
│   └── Config.ts         # Environment configuration
└── init.ts          # Application entry point
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled bot
- `npm run dev` - Run in development mode with ts-node
- `npm run watch` - Watch for changes and recompile

### Adding New Commands

1. Create a new file in `src/commands/`
2. Extend the `BaseCommand` class
3. Implement the `execute` method
4. The command will be automatically loaded

Example:

```typescript
import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction } from 'oceanic.js';

export default class MyCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'mycommand',
            description: 'My awesome command',
            userInstallable: true
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.createMessage({
            content: 'Hello from my command!'
        });
    }
}
```

## Troubleshooting

### Common Issues

1. **Bot doesn't respond to commands**
   - Check if the bot token is correct
   - Ensure the bot has the necessary permissions
   - Verify the command is registered globally

2. **TypeScript compilation errors**
   - Run `npm run build` to see detailed error messages
   - Check your TypeScript configuration in `tsconfig.json`

3. **Environment variables not loading**
   - Ensure `.env` file is in the project root
   - Check that all required variables are set

### Getting Help

- Check the [API Reference](./api/README.md) for detailed documentation
- See [Command Development Guide](./guides/command-development.md) for creating commands
- Review the [Examples](./examples/README.md) for code samples
