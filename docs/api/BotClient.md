# BotClient Class

The main bot client class that extends Oceanic.js Client with additional functionality for command handling, event management, and permission control.

## Constructor

```typescript
constructor(options: ClientOptions)
```

Creates a new BotClient instance with the provided options.

**Parameters:**
- `options` - Oceanic.js ClientOptions

**Example:**
```typescript
const client = new BotClient({
    auth: `Bot ${process.env.BOT_TOKEN}`,
    gateway: {
        intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
    }
});
```

## Properties

### commandHandler: CommandHandler
The command handler instance for managing slash commands.

### eventHandler: EventHandler
The event handler instance for managing Discord events.

### permissionManager: PermissionManager
The permission manager for handling user permissions.

### config: Config
The configuration instance containing environment variables.

### logger: Logger
The logger instance for this client.

## Methods

### initialize(): Promise<void>

Initializes the bot client by loading handlers and connecting to Discord.

**Returns:** Promise that resolves when initialization is complete.

**Example:**
```typescript
await client.initialize();
```

**Throws:**
- Error if initialization fails

### shutdown(): Promise<void>

Gracefully shuts down the bot client.

**Returns:** Promise that resolves when shutdown is complete.

**Example:**
```typescript
await client.shutdown();
```

### registerGlobalCommands(): Promise<void>

Registers all loaded commands as global slash commands with Discord.

**Returns:** Promise that resolves when commands are registered.

**Example:**
```typescript
await client.registerGlobalCommands();
```

**Throws:**
- Error if command registration fails

**Features:**
- Supports user-installable apps
- Works in guilds, DMs, and private channels
- Automatically maps command options

## Usage Example

```typescript
import { BotClient } from './client/BotClient';

async function main() {
    const client = new BotClient({
        auth: `Bot ${process.env.BOT_TOKEN}`,
        gateway: {
            intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
        }
    });

    try {
        await client.initialize();
        console.log('Bot is ready!');
    } catch (error) {
        console.error('Failed to start bot:', error);
    }
}

main();
```

## Event Integration

The BotClient automatically handles:
- Command interactions via InteractionCreate event
- Bot ready state via Ready event
- Error handling via Error event

## Command Registration

When `registerGlobalCommands()` is called, it:
1. Gets all loaded commands from CommandHandler
2. Maps them to Discord's command format
3. Registers them globally with Discord
4. Supports user-installable apps (integrationTypes: [0, 1])
5. Works in multiple contexts (guilds, DMs, private channels)
