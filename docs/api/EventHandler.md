# EventHandler Class

Manages event loading and registration. Handles dynamic event discovery and provides methods for event management.

## Constructor

```typescript
constructor(client: BotClient)
```

Creates a new event handler instance.

**Parameters:**
- `client` - BotClient instance

## Properties

### private client: BotClient
Reference to the bot client.

### private events: BaseEvent[]
Array of loaded events.

### private logger: Logger
Logger instance for this handler.

## Methods

### loadEvents(): Promise<void>

Loads all events from the events directory and registers them with the Discord client.

**Returns:** Promise that resolves when all events are loaded.

**Process:**
1. Scans the events directory for TypeScript/JavaScript files
2. Skips files starting with 'base'
3. Imports and validates event classes
4. Instantiates events
5. Registers event listeners with the Discord client
6. Handles both `once` and `on` execution modes

**Example:**
```typescript
await eventHandler.loadEvents();
```

**Throws:**
- Error if event loading fails

### getEvents(): BaseEvent[]

Gets all loaded events.

**Returns:** Array of all BaseEvent instances.

**Example:**
```typescript
const events = eventHandler.getEvents();
console.log(`Loaded ${events.length} events`);
```

## Event Loading Process

### File Discovery

The handler scans the events directory for files with extensions:
- `.ts` (development)
- `.js` (production)

### Event Validation

Each loaded file is validated:
1. Must export a default class or named export
2. Class must extend BaseEvent
3. Must have a valid name property

### Event Registration

Events are registered with the Discord client:
- `once` events use `client.once()`
- Regular events use `client.on()`
- Event names are cast to `keyof ClientEvents`

## File Structure Requirements

Events must follow this structure:

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
        // Event logic
    }
}
```

## Event Types

### Once Events

Events that should execute only once:

```typescript
export default class Ready extends BaseEvent {
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

### Regular Events

Events that can execute multiple times:

```typescript
export default class MessageCreate extends BaseEvent {
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

## Development vs Production

### Development Mode
- Loads `.ts` files directly
- Uses ts-node for TypeScript execution
- Supports hot reloading

### Production Mode
- Loads compiled `.js` files
- Requires pre-compilation with `npm run build`
- More efficient execution

## Error Handling

The handler includes comprehensive error handling:

- **File loading errors** - Logged and skipped
- **Import errors** - Logged with details
- **Validation errors** - Logged with warnings
- **Registration errors** - Logged but don't stop loading

## Common Event Patterns

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
        
        // Register global commands
        await this.client.registerGlobalCommands();
    }
}
```

### Interaction Event

```typescript
export default class InteractionCreate extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'interactionCreate'
        });
    }

    public async execute(interaction: Interaction): Promise<void> {
        if (interaction.type === InteractionTypes.APPLICATION_COMMAND) {
            // Handle slash command
            const command = this.client.commandHandler.getCommand(interaction.data.name);
            if (command) {
                await command.execute(interaction);
            }
        }
    }
}
```

### Error Event

```typescript
export default class Error extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'error'
        });
    }

    public execute(error: Error): void {
        this.client.logger.error('Client error:', error);
    }
}
```

## Usage Examples

### Loading Events

```typescript
const eventHandler = new EventHandler(client);
await eventHandler.loadEvents();
```

### Getting Event Information

```typescript
const events = eventHandler.getEvents();
events.forEach(event => {
    console.log(`${event.name} (once: ${event.once})`);
});
```

## Event Registration Details

### Once Events

```typescript
// Registered with client.once()
this.client.once(eventName, (...args) => event.execute(...args));
```

### Regular Events

```typescript
// Registered with client.on()
this.client.on(eventName, (...args) => event.execute(...args));
```

### Event Name Casting

Event names are cast to `keyof ClientEvents` to ensure type safety:

```typescript
const eventName = event.name as keyof ClientEvents;
```

## Best Practices

1. **One event per file** - Keep events in separate files
2. **Handle errors gracefully** - Wrap event logic in try-catch blocks
3. **Use appropriate logging** - Log important events and errors
4. **Check for bots** - Ignore messages from other bots
5. **Use once for setup** - Use `once: true` for initialization events
6. **Keep events focused** - One responsibility per event
7. **Test event handling** - Ensure events work correctly in development
