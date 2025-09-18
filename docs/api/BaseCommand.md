# BaseCommand Class

Abstract base class for all slash commands. Provides common functionality like permission checking, context validation, and cooldown support.

## Constructor

```typescript
constructor(client: BotClient, options: CommandOptions)
```

Creates a new command instance.

**Parameters:**
- `client` - BotClient instance
- `options` - CommandOptions configuration

## CommandOptions Interface

```typescript
interface CommandOptions {
    name: string;                    // Command name (required)
    description: string;             // Command description (required)
    options?: ApplicationCommandOptions[]; // Command options
    permissions?: string[];          // Required permissions
    userInstallable?: boolean;       // Can be used as user app
    guildOnly?: boolean;            // Guild-only command
    dmOnly?: boolean;               // DM-only command
    ownerOnly?: boolean;            // Owner-only command
    cooldown?: number;              // Cooldown in milliseconds
}
```

## Properties

### client: BotClient
Reference to the bot client instance.

### name: string
The command name used in Discord.

### description: string
The command description shown in Discord.

### options?: ApplicationCommandOptions[]
Command options/parameters.

### permissions: string[]
Required permissions for the command.

### userInstallable: boolean
Whether the command can be used as a user app in DMs.

### guildOnly: boolean
Whether the command only works in guilds.

### dmOnly: boolean
Whether the command only works in DMs.

### ownerOnly: boolean
Whether only the bot owner can use this command.

### cooldown: number
Cooldown period in milliseconds (default: 3000ms).

### filePath?: string
Path to the command file (set by CommandHandler).

## Abstract Methods

### execute(interaction: CommandInteraction): Promise<void>

**Must be implemented by subclasses.**

Executes the command logic when invoked.

**Parameters:**
- `interaction` - The command interaction from Discord

**Example:**
```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
        content: 'Hello from my command!'
    });
}
```

## Methods

### canExecute(interaction: CommandInteraction): Promise<boolean>

Checks if the user can execute this command based on permissions and context.

**Parameters:**
- `interaction` - The command interaction

**Returns:** Promise<boolean> - true if command can be executed

**Checks performed:**
1. Owner-only validation
2. Guild/DM context validation
3. User permission validation

**Example:**
```typescript
const canRun = await command.canExecute(interaction);
if (!canRun) {
    await interaction.createMessage({
        content: 'You cannot use this command.',
        flags: 64
    });
    return;
}
```

## Creating a Command

### Basic Command

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

### Command with Options

```typescript
import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';

export default class EchoCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'echo',
            description: 'Echo a message',
            userInstallable: true,
            options: [
                {
                    name: 'message',
                    description: 'Message to echo',
                    type: ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ]
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const message = interaction.data.options?.getString('message');
        
        await interaction.createMessage({
            content: `Echo: ${message}`
        });
    }
}
```

### Guild-Only Command with Permissions

```typescript
export default class ModCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'mod',
            description: 'Moderation command',
            guildOnly: true,
            permissions: ['MANAGE_MESSAGES'],
            cooldown: 5000
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // Moderation logic here
    }
}
```

## Permission System

Commands can specify required permissions that will be checked before execution:

```typescript
// In constructor
permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS']
```

The PermissionManager will check if the user has these permissions in the guild.

## Context Validation

Commands can be restricted to specific contexts:

- `guildOnly: true` - Only works in guilds
- `dmOnly: true` - Only works in DMs
- `userInstallable: true` - Can be used as user app

## Cooldowns

Commands support cooldowns to prevent spam:

```typescript
cooldown: 5000 // 5 seconds
```

The cooldown is enforced per user per command.
