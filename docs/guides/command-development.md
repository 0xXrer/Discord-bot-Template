# Command Development Guide

This guide will help you create new slash commands for the BOTMINE Discord bot.

## Table of Contents

- [Creating a Basic Command](#creating-a-basic-command)
- [Command Options](#command-options)
- [Permission System](#permission-system)
- [Context Validation](#context-validation)
- [Error Handling](#error-handling)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## Creating a Basic Command

### 1. Create Command File

Create a new file in `src/commands/` with a descriptive name:

```typescript
// src/commands/MyCommand.ts
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

### 2. Command Registration

Commands are automatically loaded by the CommandHandler. No additional registration is needed.

### 3. Test the Command

1. Build the project: `npm run build`
2. Start the bot: `npm start`
3. Use the command in Discord: `/mycommand`

## Command Options

### Basic Options

```typescript
import { ApplicationCommandOptionTypes } from 'oceanic.js';

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

### Option Types

```typescript
options: [
    {
        name: 'text',
        description: 'Text input',
        type: ApplicationCommandOptionTypes.STRING,
        required: true
    },
    {
        name: 'number',
        description: 'Number input',
        type: ApplicationCommandOptionTypes.INTEGER,
        required: false,
        min_value: 1,
        max_value: 100
    },
    {
        name: 'user',
        description: 'User selection',
        type: ApplicationCommandOptionTypes.USER,
        required: false
    },
    {
        name: 'channel',
        description: 'Channel selection',
        type: ApplicationCommandOptionTypes.CHANNEL,
        required: false
    },
    {
        name: 'role',
        description: 'Role selection',
        type: ApplicationCommandOptionTypes.ROLE,
        required: false
    },
    {
        name: 'boolean',
        description: 'Boolean input',
        type: ApplicationCommandOptionTypes.BOOLEAN,
        required: false
    }
]
```

### String Options with Choices

```typescript
options: [
    {
        name: 'color',
        description: 'Choose a color',
        type: ApplicationCommandOptionTypes.STRING,
        required: true,
        choices: [
            { name: 'Red', value: 'red' },
            { name: 'Green', value: 'green' },
            { name: 'Blue', value: 'blue' }
        ]
    }
]
```

## Permission System

### Basic Permissions

```typescript
export default class ModCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'mod',
            description: 'Moderation command',
            permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS'],
            guildOnly: true
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // Command logic here
    }
}
```

### Owner-Only Commands

```typescript
export default class OwnerCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'owner',
            description: 'Owner-only command',
            ownerOnly: true
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // Owner-only logic here
    }
}
```

## Context Validation

### Guild-Only Commands

```typescript
export default class GuildCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'guild',
            description: 'Guild-only command',
            guildOnly: true
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // This command only works in guilds
        const guild = interaction.guild;
        // ... guild-specific logic
    }
}
```

### DM-Only Commands

```typescript
export default class DMCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'dm',
            description: 'DM-only command',
            dmOnly: true
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // This command only works in DMs
    }
}
```

### User Installable Commands

```typescript
export default class UserCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'user',
            description: 'User command',
            userInstallable: true
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // This command works in DMs and as user app
    }
}
```

## Error Handling

### Basic Error Handling

```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
    try {
        // Command logic here
        await interaction.createMessage({
            content: 'Command executed successfully!'
        });
    } catch (error) {
        this.client.logger.error('Error in mycommand:', error);
        
        await interaction.createMessage({
            content: 'An error occurred while executing this command.',
            flags: 64 // Ephemeral message
        });
    }
}
```

### Deferred Responses

```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
    try {
        // Defer the response for long operations
        await interaction.defer();
        
        // Simulate long operation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Edit the deferred response
        await interaction.editOriginal({
            content: 'Long operation completed!'
        });
    } catch (error) {
        this.client.logger.error('Error in mycommand:', error);
        
        if (interaction.acknowledged) {
            await interaction.editOriginal({
                content: 'An error occurred while executing this command.'
            });
        } else {
            await interaction.createMessage({
                content: 'An error occurred while executing this command.',
                flags: 64
            });
        }
    }
}
```

## Advanced Features

### Embeds

```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
    const embed = {
        title: 'Command Result',
        description: 'This is a rich embed message',
        color: 0x5865F2,
        fields: [
            {
                name: 'Field 1',
                value: 'Value 1',
                inline: true
            },
            {
                name: 'Field 2',
                value: 'Value 2',
                inline: true
            }
        ],
        footer: {
            text: 'Command executed by ' + interaction.user.tag
        },
        timestamp: new Date().toISOString()
    };

    await interaction.createMessage({ embeds: [embed] });
}
```

### Buttons and Components

```typescript
import { ComponentTypes, ButtonStyles } from 'oceanic.js';

public async execute(interaction: CommandInteraction): Promise<void> {
    const components = [
        {
            type: ComponentTypes.ACTION_ROW,
            components: [
                {
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.PRIMARY,
                    label: 'Click Me',
                    custom_id: 'button_click'
                },
                {
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.SECONDARY,
                    label: 'Cancel',
                    custom_id: 'button_cancel'
                }
            ]
        }
    ];

    await interaction.createMessage({
        content: 'Choose an option:',
        components: components
    });
}
```

### Cooldowns

```typescript
export default class CooldownCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'cooldown',
            description: 'Command with cooldown',
            cooldown: 10000 // 10 seconds
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        // Command logic here
        // Cooldown is automatically enforced
    }
}
```

## Best Practices

### 1. Command Naming

- Use lowercase with underscores: `my_command`
- Be descriptive but concise
- Avoid special characters

### 2. Error Handling

- Always wrap command logic in try-catch
- Provide user-friendly error messages
- Log errors for debugging

### 3. Response Handling

- Use ephemeral messages for errors
- Defer responses for long operations
- Provide feedback for user actions

### 4. Permission Checks

- Use the built-in permission system
- Check permissions before executing logic
- Provide clear error messages for missing permissions

### 5. Code Organization

- One command per file
- Use descriptive class names
- Keep commands focused on single responsibility

### 6. Testing

- Test commands in different contexts (guild/DM)
- Test with different permission levels
- Test error scenarios

### 7. Documentation

- Document complex command logic
- Use clear variable names
- Add comments for non-obvious code

## Example: Complete Command

```typescript
import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';

export default class UserInfoCommand extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'userinfo',
            description: 'Get information about a user',
            userInstallable: true,
            options: [
                {
                    name: 'user',
                    description: 'User to get information about',
                    type: ApplicationCommandOptionTypes.USER,
                    required: false
                }
            ],
            cooldown: 5000
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        try {
            const targetUser = interaction.data.options?.getUser('user') || interaction.user;
            
            const embed = {
                title: 'User Information',
                description: `Information about ${targetUser.tag}`,
                color: 0x5865F2,
                fields: [
                    {
                        name: 'Username',
                        value: targetUser.tag,
                        inline: true
                    },
                    {
                        name: 'ID',
                        value: targetUser.id,
                        inline: true
                    },
                    {
                        name: 'Account Created',
                        value: `<t:${Math.floor(new Date(targetUser.createdAt).getTime() / 1000)}:F>`,
                        inline: false
                    }
                ],
                thumbnail: {
                    url: targetUser.avatarURL()
                },
                footer: {
                    text: `Requested by ${interaction.user.tag}`
                },
                timestamp: new Date().toISOString()
            };

            await interaction.createMessage({ embeds: [embed] });
        } catch (error) {
            this.client.logger.error('Error in userinfo command:', error);
            
            await interaction.createMessage({
                content: 'An error occurred while getting user information.',
                flags: 64
            });
        }
    }
}
```

This command demonstrates:
- User option parameter
- Rich embed response
- Error handling
- Cooldown
- User installable support
- Proper logging
