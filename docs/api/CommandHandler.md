# CommandHandler Class

Manages command loading, execution, and registration. Handles dynamic command discovery and provides methods for command management.

## Constructor

```typescript
constructor(client: BotClient)
```

Creates a new command handler instance.

**Parameters:**
- `client` - BotClient instance

## Properties

### private client: BotClient
Reference to the bot client.

### private commands: Collection<string, BaseCommand>
Collection of loaded commands.

### private logger: Logger
Logger instance for this handler.

## Methods

### loadCommands(): Promise<void>

Loads all commands from the commands directory.

**Returns:** Promise that resolves when all commands are loaded.

**Process:**
1. Scans the commands directory for TypeScript/JavaScript files
2. Skips files starting with 'base'
3. Imports and validates command classes
4. Instantiates commands and stores them
5. Logs loading progress

**Example:**
```typescript
await commandHandler.loadCommands();
```

**Throws:**
- Error if command loading fails

### getCommand(name: string): BaseCommand | undefined

Gets a command by name.

**Parameters:**
- `name` - Command name

**Returns:** BaseCommand instance or undefined if not found.

**Example:**
```typescript
const command = commandHandler.getCommand('ping');
if (command) {
    // Command exists
}
```

### getCommands(): BaseCommand[]

Gets all loaded commands.

**Returns:** Array of all BaseCommand instances.

**Example:**
```typescript
const commands = commandHandler.getCommands();
console.log(`Loaded ${commands.length} commands`);
```

### hasCommand(name: string): boolean

Checks if a command exists.

**Parameters:**
- `name` - Command name

**Returns:** true if command exists, false otherwise.

**Example:**
```typescript
if (commandHandler.hasCommand('help')) {
    console.log('Help command is loaded');
}
```

### reloadCommand(name: string): Promise<boolean>

Reloads a specific command from its file.

**Parameters:**
- `name` - Command name to reload

**Returns:** Promise<boolean> - true if reloaded successfully

**Process:**
1. Finds the command by name
2. Clears the require cache for the command file
3. Removes the old command
4. Imports and instantiates the new command
5. Updates the command collection

**Example:**
```typescript
const success = await commandHandler.reloadCommand('ping');
if (success) {
    console.log('Command reloaded successfully');
}
```

**Throws:**
- Error if reload fails

## Command Loading Process

### File Discovery

The handler scans the commands directory for files with extensions:
- `.ts` (development)
- `.js` (production)

### Command Validation

Each loaded file is validated:
1. Must export a default class or named export
2. Class must extend BaseCommand
3. Must have a valid name property

### Error Handling

Failed command loads are logged but don't stop the loading process:
- Invalid command classes are skipped
- Import errors are logged
- Missing name properties are warned

## File Structure Requirements

Commands must follow this structure:

```typescript
import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction } from 'oceanic.js';

export default class MyCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'mycommand',
            description: 'My command description'
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // Command logic
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

## Command Registration

Commands are registered globally with Discord via `BotClient.registerGlobalCommands()`:

1. Gets all loaded commands
2. Maps them to Discord's command format
3. Registers them using `bulkEditGlobalCommands()`
4. Supports user-installable apps

## Error Handling

The handler includes comprehensive error handling:

- **File loading errors** - Logged and skipped
- **Import errors** - Logged with details
- **Validation errors** - Logged with warnings
- **Reload errors** - Logged and returns false

## Usage Examples

### Loading Commands

```typescript
const commandHandler = new CommandHandler(client);
await commandHandler.loadCommands();
```

### Getting Command Information

```typescript
// Check if command exists
if (commandHandler.hasCommand('help')) {
    const helpCommand = commandHandler.getCommand('help');
    console.log(`Help command: ${helpCommand.description}`);
}

// Get all commands
const commands = commandHandler.getCommands();
commands.forEach(cmd => {
    console.log(`${cmd.name}: ${cmd.description}`);
});
```

### Reloading Commands

```typescript
// Reload a specific command
const success = await commandHandler.reloadCommand('ping');
if (success) {
    console.log('Ping command reloaded');
} else {
    console.log('Failed to reload ping command');
}
```

## Best Practices

1. **One command per file** - Keep commands in separate files
2. **Use descriptive names** - Command names should be clear
3. **Handle errors gracefully** - Wrap command logic in try-catch
4. **Test reloading** - Ensure commands can be reloaded during development
5. **Use TypeScript** - Leverage type safety for better development experience
