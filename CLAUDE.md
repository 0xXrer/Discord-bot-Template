# CLAUDE.md - AI Assistant Guide for Discord Bot Template

## Project Overview

This is a **Discord Bot Template** built with **Oceanic.js** and **TypeScript**. The template provides a robust, modular foundation for building Discord bots with support for:
- User-installable applications
- Slash commands
- Event handling
- Permission management
- Structured logging
- Development and production environments

**Key Technologies:**
- **Oceanic.js** v1.10.2 - Discord API library
- **TypeScript** v5.2.2 - Type-safe JavaScript
- **dotenv** v16.3.1 - Environment configuration
- **Node.js** 18+ - Runtime environment

**Project License:** MIT (Copyright 2025 0xXrer)

---

## Repository Structure

```
Discord-bot-Template/
├── src/
│   ├── client/              # Core bot client
│   │   └── BotClient.ts     # Main bot class extending Oceanic Client
│   ├── commands/            # Slash command implementations
│   │   ├── BaseCommand.ts   # Abstract base class for all commands
│   │   ├── Ping.ts          # Example: Latency check command
│   │   ├── Help.ts          # Example: Help command
│   │   └── UserInfo.ts      # Example: User information command
│   ├── events/              # Discord event handlers
│   │   ├── BaseEvent.ts     # Abstract base class for all events
│   │   ├── Ready.ts         # Bot ready event (registers commands)
│   │   ├── InteractionCreate.ts  # Handles slash command interactions
│   │   └── Error.ts         # Global error handler
│   ├── handlers/            # Dynamic loading systems
│   │   ├── CommandHandler.ts  # Commands loader and manager
│   │   └── EventHandler.ts    # Events loader and manager
│   ├── managers/            # Bot management systems
│   │   └── PermissionManager.ts  # Permission levels and checks
│   ├── utils/               # Utility functions
│   │   ├── Logger.ts        # Structured logging system
│   │   └── FileUtils.ts     # File operations (recursive reads, JSON I/O)
│   ├── config/              # Configuration management
│   │   └── Config.ts        # Environment variable validation
│   └── init.ts              # Application entry point
├── docs/                    # Documentation
│   ├── getting-started.md   # Setup and installation guide
│   ├── api/                 # API documentation for each class
│   └── guides/              # Development guides
├── dist/                    # Compiled JavaScript (generated)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── exemple.env              # Environment variables template
└── LICENSE                  # MIT License
```

---

## Architecture Patterns

### 1. **Base Class Pattern**

The codebase uses abstract base classes for extensibility:

#### Commands: `src/commands/BaseCommand.ts`
All commands extend `BaseCommand` and must implement:
- `execute(interaction: CommandInteraction): Promise<void>`

Example command structure:
```typescript
export default class MyCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'commandname',
            description: 'Command description',
            options: [],              // Optional: slash command options
            permissions: [],          // Optional: required permissions
            userInstallable: true,    // Can be installed by users
            guildOnly: false,         // Restrict to guilds only
            dmOnly: false,            // Restrict to DMs only
            ownerOnly: false,         // Bot owner only
            cooldown: 3000           // Cooldown in milliseconds
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // Command logic here
    }
}
```

**Key Command Properties:**
- `name` - Command identifier (required)
- `description` - Shows in Discord UI (required)
- `options` - Slash command parameters
- `permissions` - Array of required permission strings
- `userInstallable` - Supports user-installed apps (default: true)
- `guildOnly` - Only executable in guilds
- `dmOnly` - Only executable in DMs
- `ownerOnly` - Restricted to bot owner
- `cooldown` - Milliseconds between uses (default: 3000)

#### Events: `src/events/BaseEvent.ts`
All events extend `BaseEvent` and must implement:
- `execute(...args: any[]): Promise<void> | void`

Example event structure:
```typescript
export default class MyEvent extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'eventName',  // Discord event name (e.g., 'ready', 'messageCreate')
            once: false         // If true, event fires only once
        });
    }

    public async execute(...args: any[]): Promise<void> {
        // Event handling logic
    }
}
```

### 2. **Dynamic Loading System**

Both commands and events are **automatically discovered and loaded** at startup.

**CommandHandler** (`src/handlers/CommandHandler.ts:19-70`):
- Recursively scans `src/commands/` directory
- Filters for `.ts` files in development, `.js` in production
- Skips files starting with "base" (case-insensitive)
- Validates classes extend `BaseCommand`
- Stores commands in a Collection (Map) by name
- Supports hot-reloading via `reloadCommand()` method

**EventHandler** (`src/handlers/EventHandler.ts:19-75`):
- Recursively scans `src/events/` directory
- Filters for `.ts` files in development, `.js` in production
- Skips files starting with "base"
- Validates classes extend `BaseEvent`
- Registers events with `client.on()` or `client.once()`

### 3. **Permission System**

**PermissionManager** (`src/managers/PermissionManager.ts`) provides:
- Permission levels: `USER (0)`, `MODERATOR (1)`, `ADMIN (2)`, `OWNER (3)`
- Per-user permissions (global or guild-specific)
- Wildcard permission (`*`) grants all permissions
- Owner ID from config automatically gets `*` permission

**Usage in Commands:**
Commands with `permissions` array are checked via `canExecute()` before execution.

### 4. **Configuration Management**

**Config** (`src/config/Config.ts`) validates required environment variables:
- `BOT_TOKEN` - Discord bot token (required)
- `CLIENT_ID` - Discord application ID (required)
- `CLIENT_SECRET` - OAuth2 secret (required)
- `OWNER_ID` - Bot owner user ID (optional but recommended)
- `NODE_ENV` - `development` or `production` (default: development)
- `LOG_LEVEL` - Logging verbosity (default: info)
- `DATABASE_URL` - Optional database connection string

**Validation:** Throws errors on startup if required variables are missing.

---

## Development Workflows

### Initial Setup

1. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd Discord-bot-Template
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp exemple.env .env
   # Edit .env with your credentials
   ```

3. **Build and Run:**
   ```bash
   # Development (with ts-node)
   npm run dev

   # Production
   npm run build
   npm start
   ```

### Adding New Commands

1. **Create file:** `src/commands/MyCommand.ts`
2. **Extend BaseCommand:**
   ```typescript
   import { BaseCommand } from './BaseCommand';
   import { BotClient } from '../client/BotClient';
   import { CommandInteraction } from 'oceanic.js';

   export default class MyCommand extends BaseCommand {
       constructor(client: BotClient) {
           super(client, {
               name: 'mycommand',
               description: 'Does something cool',
               userInstallable: true
           });
       }

       public async execute(interaction: CommandInteraction): Promise<void> {
           await interaction.createMessage({
               content: 'Response here!'
           });
       }
   }
   ```
3. **Restart bot** - Command auto-loads on next startup
4. **Register globally** - Commands register on `ready` event via `registerGlobalCommands()`

### Adding New Events

1. **Create file:** `src/events/MyEvent.ts`
2. **Extend BaseEvent:**
   ```typescript
   import { BaseEvent } from './BaseEvent';
   import { BotClient } from '../client/BotClient';

   export default class MyEvent extends BaseEvent {
       constructor(client: BotClient) {
           super(client, {
               name: 'guildCreate',  // Discord event name
               once: false
           });
       }

       public async execute(guild: any): Promise<void> {
           this.client.logger.info(`Joined guild: ${guild.name}`);
       }
   }
   ```
3. **Restart bot** - Event auto-loads and registers

### Testing Changes

**Development Mode:**
```bash
npm run dev  # Uses ts-node for live TypeScript execution
```

**Production Build:**
```bash
npm run build    # Compiles to dist/
npm start        # Runs compiled code
```

**Watch Mode:**
```bash
npm run watch  # Recompiles on file changes (still need manual restart)
```

---

## Key Conventions & Patterns

### File Naming
- **Commands:** PascalCase, e.g., `Ping.ts`, `UserInfo.ts`
- **Events:** PascalCase matching event name, e.g., `Ready.ts`, `InteractionCreate.ts`
- **Files starting with "Base" are skipped** during auto-loading

### Export Pattern
- All command and event files must use **default export**:
  ```typescript
  export default class MyCommand extends BaseCommand { ... }
  ```

### Logging
Use the `Logger` class for all output:
```typescript
this.client.logger.debug('Debug message');
this.client.logger.info('Info message');
this.client.logger.warn('Warning message');
this.client.logger.error('Error message', errorObject);
```

**Log Levels:** DEBUG (0), INFO (1), WARN (2), ERROR (3)

### Error Handling
- Commands should handle errors internally
- Global error handler exists in `src/events/Error.ts`
- Unhandled rejections and exceptions are caught in `src/init.ts:52-59`

### Graceful Shutdown
Handled in `src/init.ts:33-43`:
- SIGINT (Ctrl+C) triggers `client.shutdown()`
- SIGTERM also triggers graceful shutdown
- Always cleanup connections before exit

---

## Important Implementation Details

### User-Installable Apps
Commands registered with `integrationTypes: [0, 1]` support:
- `0` = Guild install (traditional server bot)
- `1` = User install (user can install for personal use)

Context support (`contexts: [0, 1, 2]`):
- `0` = Guild channels
- `1` = Bot DMs
- `2` = Private channels / Group DMs

**Implementation:** See `src/client/BotClient.ts:54-73`

### Command Interaction Flow
1. User invokes slash command
2. `InteractionCreate` event fires
3. `CommandHandler.getCommand()` retrieves command instance
4. `command.canExecute()` checks permissions
5. `command.execute()` runs command logic

### File Utilities
**FileUtils** (`src/utils/FileUtils.ts`) provides:
- `getFiles(directory, extension)` - Recursive file discovery
- `ensureDirectory(directory)` - Create directories safely
- `fileExists(filePath)` - Check file existence
- `readJsonFile<T>(filePath)` - Type-safe JSON reading
- `writeJsonFile<T>(filePath, data)` - Type-safe JSON writing

---

## Code Modification Guidelines

### When Adding Features

1. **Always extend base classes** - Don't create standalone command/event files
2. **Use TypeScript strict mode** - Type safety is enforced
3. **Follow existing patterns** - Study `Ping.ts` and `Ready.ts` as templates
4. **Log appropriately** - Use Logger for visibility
5. **Handle errors gracefully** - Try/catch in execute methods

### When Refactoring

1. **Preserve base class contracts** - Commands need `execute()`, events need `execute()`
2. **Maintain auto-loading compatibility** - Files must export default class
3. **Test in development mode first** - Use `npm run dev`
4. **Update TypeScript types** - Keep type definitions accurate

### Code Style
- **Indentation:** Likely 4 spaces (based on existing files)
- **Imports:** ES6 imports, organize logically
- **Access modifiers:** Use `public`, `private`, `protected` appropriately
- **Async/await:** Preferred over raw promises
- **String literals:** Single quotes for strings, template literals for interpolation

---

## Common Pitfalls & Solutions

### Issue: Command Not Loading
**Causes:**
- File doesn't export default class
- Class doesn't extend `BaseCommand`
- Filename starts with "base" (case-insensitive)
- Not using correct file extension (.ts in dev, .js in prod)

**Solution:** Verify export pattern and inheritance chain

### Issue: Permission Denied
**Causes:**
- `ownerOnly: true` but `OWNER_ID` not set in .env
- `permissions` array requires specific permissions user lacks
- `guildOnly: true` but executed in DM

**Solution:** Check `canExecute()` logic in `BaseCommand.ts:44-73`

### Issue: Events Not Firing
**Causes:**
- Event name mismatch (must match Oceanic.js event names)
- File doesn't extend `BaseEvent`
- Missing default export

**Solution:** Verify event name matches Discord Gateway events

### Issue: TypeScript Compilation Errors
**Common errors:**
- Missing types for Oceanic.js - ensure `oceanic.js` package installed
- Strict null checks - initialize all properties or mark optional with `?`
- Module resolution - check `tsconfig.json` paths

**Solution:** Run `npm run build` to see detailed errors

---

## Testing Strategies

### Manual Testing
1. **Test in development server first** - Use a test Discord server
2. **Check different contexts:**
   - Guild channels
   - DMs with bot
   - User-installed contexts
3. **Verify permissions** - Test with different user roles
4. **Test error cases** - Invalid inputs, missing permissions, etc.

### Logging for Debugging
```typescript
this.client.logger.debug('Variable value:', someVariable);
this.client.logger.info('Checkpoint reached');
```

### Command Registration
- Commands register **globally** on bot startup (Ready event)
- Changes require bot restart to take effect
- Can take 1-2 minutes for Discord to propagate updates

---

## Environment-Specific Behavior

### Development Mode (`NODE_ENV=development`)
- Loads `.ts` files directly with `ts-node`
- More verbose logging (set `LOG_LEVEL=debug`)
- Faster iteration (no compilation step)

### Production Mode (`NODE_ENV=production`)
- Loads compiled `.js` files from `dist/`
- Optimized performance
- Requires `npm run build` before deployment

---

## Integration Points for AI Assistants

### When Asked to Add Commands
1. **Determine command specifications:**
   - Name, description, options
   - Permissions needed
   - User-installable or guild-only
2. **Create file in `src/commands/`** following patterns
3. **Test with `npm run dev`**
4. **Verify registration** via Discord developer portal or `/help` command

### When Asked to Add Events
1. **Identify Discord event name** (e.g., `guildMemberAdd`, `messageCreate`)
2. **Create file in `src/events/`** extending `BaseEvent`
3. **Access client/logger** via `this.client`
4. **Test thoroughly** - events can fire frequently

### When Asked to Modify Core Systems
1. **Review impact on base classes** - Changes affect all commands/events
2. **Update documentation** if contracts change
3. **Test existing commands/events** for breakage
4. **Consider backward compatibility**

### When Asked About Configuration
1. **Check `exemple.env`** for available variables
2. **Verify validation in `Config.ts`** for required fields
3. **Document new environment variables** in both files

---

## Quick Reference

### File Locations
- **Entry point:** `src/init.ts`
- **Main client:** `src/client/BotClient.ts`
- **Command base:** `src/commands/BaseCommand.ts`
- **Event base:** `src/events/BaseEvent.ts`
- **Config validation:** `src/config/Config.ts`
- **Logger:** `src/utils/Logger.ts`

### Key Methods
- `client.initialize()` - Loads handlers and connects to Discord
- `client.registerGlobalCommands()` - Registers slash commands globally
- `client.shutdown()` - Graceful disconnect
- `commandHandler.loadCommands()` - Discovers and loads all commands
- `eventHandler.loadEvents()` - Discovers and registers all events

### Available npm Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled bot (production)
- `npm run dev` - Run with ts-node (development)
- `npm run watch` - Watch mode compilation

---

## Additional Resources

- **Oceanic.js Documentation:** https://docs.oceanic.ws/
- **Discord Developer Portal:** https://discord.com/developers/applications
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Project Documentation:** `/docs/getting-started.md`
- **API Reference:** `/docs/api/README.md`

---

## Notes for AI Assistants

1. **Always read existing implementations first** - The codebase has established patterns
2. **Prefer modification over creation** - Extend existing systems rather than creating parallel ones
3. **Maintain TypeScript strict mode** - Type safety is critical
4. **Test before committing** - Run `npm run dev` to verify changes
5. **Document new features** - Update relevant documentation files
6. **Follow the base class pattern** - Never bypass the handler systems
7. **Use the Logger** - No `console.log()`, always use `this.client.logger`
8. **Handle edge cases** - Consider guild/DM contexts, permissions, user vs guild installs

**When in doubt, study the existing command/event examples:** `Ping.ts` and `Ready.ts` demonstrate best practices.
