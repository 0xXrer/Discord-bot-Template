# Documentation

Welcome to the Discord bot documentation. This is a modern Discord bot built with TypeScript and Oceanic.js, featuring user-installable commands and a robust architecture.

## Table of Contents

- [Getting Started](./getting-started.md)
- [API Reference](./api/README.md)
- [Command Development](./guides/command-development.md)
- [Event Development](./guides/event-development.md)
- [Configuration](./guides/configuration.md)
- [Deployment](./guides/deployment.md)
- [Examples](./examples/README.md)

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `exemple.env` to `.env` and configure your bot token
4. Build the project: `npm run build`
5. Start the bot: `npm start`

## Features

- 🚀 **Modern Architecture**: Built with TypeScript and Oceanic.js
- 📱 **User Installable Commands**: Commands work in DMs and as user apps
- 🔧 **Modular Design**: Easy to extend with new commands and events
- 🛡️ **Permission System**: Flexible permission management
- 📝 **Comprehensive Logging**: Built-in logging system
- ⚡ **Hot Reload**: Development-friendly with TypeScript compilation

## Project Structure

```
src/
├── client/          # Bot client and core functionality
├── commands/        # Slash commands
├── events/          # Discord events
├── handlers/        # Command and event handlers
├── managers/        # Permission and other managers
├── utils/           # Utility functions
└── config/          # Configuration management
```

## Available Commands

- `/ping` - Check bot latency
- `/help` - Get help with commands
- `/userinfo` - Get user information

## Contributing

See [Command Development Guide](./guides/command-development.md) for information on adding new commands.

## License

MIT License - see LICENSE file for details.
