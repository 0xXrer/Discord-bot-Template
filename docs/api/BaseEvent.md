# BaseEvent Class

Abstract base class for all Discord events. Provides a consistent interface for event handling with support for once/on execution modes.

## Constructor

```typescript
constructor(client: BotClient, options: EventOptions)
```

Creates a new event instance.

**Parameters:**
- `client` - BotClient instance
- `options` - EventOptions configuration

## EventOptions Interface

```typescript
interface EventOptions {
    name: string;        // Event name (required)
    once?: boolean;      // Execute only once (default: false)
}
```

## Properties

### client: BotClient
Reference to the bot client instance.

### name: string
The Discord event name (e.g., 'ready', 'interactionCreate').

### once: boolean
Whether the event should execute only once (default: false).

## Abstract Methods

### execute(...args: any[]): Promise<void> | void

**Must be implemented by subclasses.**

Handles the event when it occurs.

**Parameters:**
- `...args` - Event arguments (varies by event type)

**Returns:** Promise<void> | void

## Creating an Event

### Basic Event

```typescript
import { BaseEvent } from './BaseEvent';
import { BotClient } from '../client/BotClient';

export default class MyEvent extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'messageCreate'
        });
    }

    public async execute(message: Message): Promise<void> {
        console.log(`New message: ${message.content}`);
    }
}
```

### Once Event

```typescript
import { BaseEvent } from './BaseEvent';
import { BotClient } from '../client/BotClient';

export default class ReadyEvent extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'ready',
            once: true
        });
    }

    public async execute(): Promise<void> {
        console.log('Bot is ready!');
    }
}
```

## Common Event Types

### Ready Event

```typescript
export default class Ready extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'ready',
            once: true
        });
    }

    public async execute(): Promise<void> {
        this.client.logger.info(`Ready as ${this.client.user?.tag}`);
        this.client.logger.info(`Serving ${this.client.guilds.size} guilds`);
    }
}
```

### Message Event

```typescript
export default class MessageCreate extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'messageCreate'
        });
    }

    public async execute(message: Message): Promise<void> {
        if (message.author.bot) return;
        
        // Handle message
        console.log(`${message.author.tag}: ${message.content}`);
    }
}
```

### Guild Event

```typescript
export default class GuildCreate extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'guildCreate'
        });
    }

    public async execute(guild: Guild): Promise<void> {
        this.client.logger.info(`Joined guild: ${guild.name} (${guild.id})`);
    }
}
```

## Event Registration

Events are automatically registered by the EventHandler when loaded. The handler will:

1. Load all event files from the events directory
2. Instantiate event classes
3. Register event listeners with the Discord client
4. Handle both `once` and `on` execution modes

## Error Handling

Events should handle their own errors to prevent crashes:

```typescript
public async execute(message: Message): Promise<void> {
    try {
        // Event logic here
    } catch (error) {
        this.client.logger.error('Error in messageCreate event:', error);
    }
}
```

## Event Arguments

Different events receive different arguments. Common patterns:

- `ready` - No arguments
- `messageCreate` - `(message: Message)`
- `guildCreate` - `(guild: Guild)`
- `interactionCreate` - `(interaction: Interaction)`
- `error` - `(error: Error)`

Check the Oceanic.js documentation for specific event signatures.

## Best Practices

1. **Handle errors gracefully** - Wrap event logic in try-catch blocks
2. **Use appropriate logging** - Log important events and errors
3. **Check for bots** - Ignore messages from other bots
4. **Use once for setup** - Use `once: true` for initialization events
5. **Keep events focused** - One event per file, one responsibility per event
