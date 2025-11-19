# Creating Commands Guide

Learn how to create slash commands for your Discord bot using the template's decorator-based system.

## Table of Contents

- [Quick Start](#quick-start)
- [Command Structure](#command-structure)
- [Adding Options](#adding-options)
- [Permission Management](#permission-management)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Common Examples](#common-examples)

## Quick Start

### 1. Create Command File

Create a new file in your module's `commands/` directory:

```
src/modules/general/commands/MyCommand.command.ts
```

### 2. Basic Command Template

```typescript
import { CommandInteraction } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command } from '@core/decorators';

@Command('mycommand', 'Description of what this command does')
export class MyCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: 'Hello from MyCommand!'
    });
  }
}
```

### 3. Register in Module

Add the command to your module:

```typescript
// src/modules/general/General.module.ts
import { MyCommand } from './commands/MyCommand.command';

export class GeneralModule extends BaseModule {
  async initialize(client: ExtendedClient): Promise<void> {
    await this.registerCommands([
      PingCommand,
      HelpCommand,
      MyCommand  // Add your command here
    ]);
  }
}
```

### 4. Restart Bot

Restart your bot to register the command:

```bash
npm run dev
```

The command will appear in Discord as `/mycommand`.

## Command Structure

### Naming Conventions

**File naming:**
- Use PascalCase: `MyCommand.command.ts`
- Add `.command.ts` suffix for clarity

**Command names:**
- Lowercase only
- No spaces (use hyphens if needed)
- 1-32 characters
- Descriptive and memorable

```typescript
// Good
@Command('ping', 'Check bot latency')
@Command('user-info', 'Get user information')
@Command('ban', 'Ban a user from the server')

// Bad
@Command('PING', '...')           // No uppercase
@Command('user info', '...')      // No spaces
@Command('x', '...')              // Not descriptive
@Command('ThisIsAReallyLongCommandName...', '...') // Too long
```

### Command Description

- Keep it concise (1-100 characters)
- Describe what the command does
- Start with a verb

```typescript
// Good
@Command('ban', 'Ban a user from the server')
@Command('search', 'Search for information online')

// Bad
@Command('ban', 'ban')  // Too short
@Command('ban', 'This command will ban a user from the server if you have the proper permissions and they are not a bot or the server owner') // Too long
```

## Adding Options

Options let users provide input to commands.

### Basic String Option

```typescript
import { ApplicationCommandOptionTypes } from 'oceanic.js';

@Command('say', 'Make the bot say something')
@Option({
  name: 'message',
  description: 'Message to send',
  type: ApplicationCommandOptionTypes.STRING,
  required: true
})
export class SayCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const message = interaction.data.options.getString('message', true);
    await interaction.createMessage({ content: message });
  }
}
```

### User Option

```typescript
@Command('userinfo', 'Get information about a user')
@Option({
  name: 'user',
  description: 'User to get info about',
  type: ApplicationCommandOptionTypes.USER,
  required: false  // If not provided, use command author
})
export class UserInfoCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user') ?? interaction.user;

    await interaction.createMessage({
      content: `User: ${user.tag}\nID: ${user.id}\nCreated: ${user.createdAt}`
    });
  }
}
```

### Number Option with Constraints

```typescript
@Command('roll', 'Roll a dice')
@Option({
  name: 'sides',
  description: 'Number of sides on the dice',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: false,
  min_value: 2,
  max_value: 100
})
export class RollCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const sides = interaction.data.options.getInteger('sides') ?? 6;
    const result = Math.floor(Math.random() * sides) + 1;

    await interaction.createMessage({
      content: `🎲 You rolled a **${result}** (d${sides})`
    });
  }
}
```

### String Option with Choices

```typescript
@Command('game', 'Set your current game')
@Option({
  name: 'gamename',
  description: 'Select a game',
  type: ApplicationCommandOptionTypes.STRING,
  required: true,
  choices: [
    { name: '🎮 Minecraft', value: 'minecraft' },
    { name: '⚔️ Fortnite', value: 'fortnite' },
    { name: '🚀 Among Us', value: 'among_us' },
    { name: '🎯 Valorant', value: 'valorant' }
  ]
})
export class GameCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const game = interaction.data.options.getString('gamename', true);
    await interaction.createMessage({
      content: `Now playing: ${game}`
    });
  }
}
```

### Multiple Options

```typescript
@Command('remindme', 'Set a reminder')
@Option({
  name: 'time',
  description: 'Time in minutes',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: true,
  min_value: 1,
  max_value: 10080  // 1 week
})
@Option({
  name: 'message',
  description: 'Reminder message',
  type: ApplicationCommandOptionTypes.STRING,
  required: true,
  max_length: 1000
})
export class RemindMeCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const time = interaction.data.options.getInteger('time', true);
    const message = interaction.data.options.getString('message', true);

    setTimeout(async () => {
      await interaction.user.createDM().then(dm =>
        dm.createMessage({ content: `⏰ Reminder: ${message}` })
      );
    }, time * 60 * 1000);

    await interaction.createMessage({
      content: `✅ Reminder set for ${time} minute(s)!`,
      flags: MessageFlags.EPHEMERAL
    });
  }
}
```

### All Option Types

```typescript
import { ApplicationCommandOptionTypes } from 'oceanic.js';

@Command('demo', 'Demonstrates all option types')
@Option({
  name: 'text',
  description: 'String input',
  type: ApplicationCommandOptionTypes.STRING
})
@Option({
  name: 'number',
  description: 'Integer input',
  type: ApplicationCommandOptionTypes.INTEGER
})
@Option({
  name: 'decimal',
  description: 'Number with decimals',
  type: ApplicationCommandOptionTypes.NUMBER
})
@Option({
  name: 'yesno',
  description: 'Boolean choice',
  type: ApplicationCommandOptionTypes.BOOLEAN
})
@Option({
  name: 'user',
  description: 'Select a user',
  type: ApplicationCommandOptionTypes.USER
})
@Option({
  name: 'channel',
  description: 'Select a channel',
  type: ApplicationCommandOptionTypes.CHANNEL
})
@Option({
  name: 'role',
  description: 'Select a role',
  type: ApplicationCommandOptionTypes.ROLE
})
@Option({
  name: 'mention',
  description: 'Select user or role',
  type: ApplicationCommandOptionTypes.MENTIONABLE
})
@Option({
  name: 'file',
  description: 'Upload a file',
  type: ApplicationCommandOptionTypes.ATTACHMENT
})
export class DemoCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const text = interaction.data.options.getString('text');
    const number = interaction.data.options.getInteger('number');
    const decimal = interaction.data.options.getNumber('decimal');
    const yesno = interaction.data.options.getBoolean('yesno');
    const user = interaction.data.options.getUser('user');
    const channel = interaction.data.options.getChannel('channel');
    const role = interaction.data.options.getRole('role');
    const mention = interaction.data.options.getMentionable('mention');
    const file = interaction.data.options.getAttachment('file');

    // Process options...
  }
}
```

## Permission Management

### Require Discord Permissions

```typescript
@Command('kick', 'Kick a user')
@RequirePermissions('KICK_MEMBERS')
export class KickCommand extends BaseCommand {
  // User must have KICK_MEMBERS permission
}
```

### Multiple Permissions (User Needs ALL)

```typescript
@Command('setup', 'Configure bot settings')
@RequirePermissions('ADMINISTRATOR', 'MANAGE_GUILD')
export class SetupCommand extends BaseCommand {
  // User must have both ADMINISTRATOR AND MANAGE_GUILD
}
```

### Guild Only

```typescript
@Command('ban', 'Ban a user')
@GuildOnly()
export class BanCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // This will never be called in DMs
    // interaction.guild is guaranteed to exist
  }
}
```

### DM Only

```typescript
@Command('privacy', 'View privacy settings')
@DMOnly()
export class PrivacyCommand extends BaseCommand {
  // Only works in DMs
}
```

### Owner Only

```typescript
@Command('eval', 'Evaluate code')
@OwnerOnly()
export class EvalCommand extends BaseCommand {
  // Only the bot owner (OWNER_ID in .env) can use this
}
```

### Combining Guards

```typescript
@Command('ban', 'Ban a user')
@RequirePermissions('BAN_MEMBERS')
@GuildOnly()
@Cooldown(5000)
export class BanCommand extends BaseCommand {
  // Must have BAN_MEMBERS permission
  // Must be in a guild
  // 5 second cooldown between uses
}
```

## Advanced Features

### Using Dependency Injection

```typescript
import { inject } from 'tsyringe';
import { DatabaseService } from '@database/DatabaseService';

@Command('warnings', 'View user warnings')
@GuildOnly()
export class WarningsCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    @inject(DatabaseService) private db: DatabaseService
  ) {
    super(client);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user') ?? interaction.user;

    const warnings = await this.db.warning.findMany({
      where: {
        userId: user.id,
        guildId: interaction.guildID!
      }
    });

    await interaction.createMessage({
      content: `${user.tag} has ${warnings.length} warning(s)`
    });
  }
}
```

### Deferred Responses

For commands that take time to process:

```typescript
@Command('analyze', 'Analyze server data')
export class AnalyzeCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Show "Bot is thinking..." message
    await interaction.defer();

    // Perform long operation
    const analysis = await this.analyzeServerData(interaction.guildID!);

    // Edit the deferred response
    await interaction.editOriginal({
      content: `Analysis complete!\n${analysis}`
    });
  }

  private async analyzeServerData(guildId: string): Promise<string> {
    // Long-running operation
    await new Promise(resolve => setTimeout(resolve, 5000));
    return 'Analysis results...';
  }
}
```

### Ephemeral Responses

Messages only visible to the command user:

```typescript
import { MessageFlags } from 'oceanic.js';

@Command('token', 'View your API token')
export class TokenCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: `Your token: ${generateToken(interaction.user.id)}`,
      flags: MessageFlags.EPHEMERAL  // Only user can see this
    });
  }
}
```

### Using Embeds

```typescript
import { EmbedBuilder } from '@common/builders';

@Command('serverinfo', 'View server information')
@GuildOnly()
export class ServerInfoCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    const embed = EmbedBuilder.info('Server Information', guild.description ?? '')
      .setThumbnail(guild.iconURL() ?? undefined)
      .addField('Owner', `<@${guild.ownerID}>`, true)
      .addField('Members', guild.memberCount.toString(), true)
      .addField('Created', guild.createdAt.toDateString(), true)
      .addField('Boost Level', `Level ${guild.premiumTier}`, true)
      .addField('Boosts', guild.premiumSubscriptionCount?.toString() ?? '0', true)
      .setTimestamp()
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

### Using Components (Buttons)

```typescript
import { ComponentBuilder } from '@common/builders';

@Command('confirm', 'Test confirmation buttons')
export class ConfirmCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: 'Are you sure?',
      components: [
        ComponentBuilder.actionRow([
          ComponentBuilder.button('success', 'confirm_yes', 'Yes'),
          ComponentBuilder.button('danger', 'confirm_no', 'No')
        ])
      ]
    });

    // Note: Button interaction handling would be in a separate event handler
  }
}
```

### Error Handling

```typescript
@Command('api', 'Call external API')
export class ApiCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      await interaction.defer();

      const data = await fetch('https://api.example.com/data')
        .then(r => r.json());

      await interaction.editOriginal({
        content: `Data: ${JSON.stringify(data)}`
      });

    } catch (error) {
      this.client.logger.error('API command error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await interaction.editOriginal({
        embeds: [
          EmbedBuilder.error('API Error', errorMessage).build()
        ]
      });
    }
  }
}
```

## Best Practices

### 1. Validate User Input

Even with Discord's built-in validation:

```typescript
const amount = interaction.data.options.getInteger('amount', true);

if (amount < 1) {
  await interaction.createMessage({
    content: '❌ Amount must be positive!',
    flags: MessageFlags.EPHEMERAL
  });
  return;
}
```

### 2. Provide Feedback

Always let users know what happened:

```typescript
// Good
await interaction.createMessage({ content: '✅ Settings saved!' });

// Bad
// No response
```

### 3. Use Cooldowns to Prevent Spam

```typescript
@Command('search', 'Search the web')
@Cooldown(10000)  // 10 second cooldown
export class SearchCommand extends BaseCommand { }
```

### 4. Log Important Actions

```typescript
this.client.logger.info(`${interaction.user.tag} used ${this.name}`);
this.client.logger.warn(`Failed action in ${this.name}`);
this.client.logger.error('Error in command:', error);
```

### 5. Handle Permissions Gracefully

```typescript
if (!interaction.member?.permissions.has('BAN_MEMBERS')) {
  await interaction.createMessage({
    content: '❌ You need the Ban Members permission!',
    flags: MessageFlags.EPHEMERAL
  });
  return;
}
```

## Common Examples

### User Information Command

```typescript
@Command('whois', 'Get information about a user')
@Option({
  name: 'user',
  description: 'User to get info about',
  type: ApplicationCommandOptionTypes.USER,
  required: false
})
@GuildOnly()
export class WhoisCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user') ?? interaction.user;
    const member = await interaction.guild!.getMember(user.id);

    const embed = EmbedBuilder.info(`User: ${user.tag}`, '')
      .setThumbnail(user.avatarURL())
      .addField('ID', user.id, true)
      .addField('Bot', user.bot ? 'Yes' : 'No', true)
      .addField('Account Created', user.createdAt.toDateString(), false)
      .addField('Joined Server', member.joinedAt?.toDateString() ?? 'Unknown', false)
      .addField('Roles', member.roles.map(r => `<@&${r}>`).join(', ') || 'None', false)
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

### Purge Messages Command

```typescript
@Command('purge', 'Delete multiple messages')
@Option({
  name: 'amount',
  description: 'Number of messages to delete',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: true,
  min_value: 1,
  max_value: 100
})
@RequirePermissions('MANAGE_MESSAGES')
@GuildOnly()
export class PurgeCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const amount = interaction.data.options.getInteger('amount', true);

    await interaction.defer({ flags: MessageFlags.EPHEMERAL });

    try {
      const channel = interaction.channel;
      if (!channel || !('messages' in channel)) {
        throw new Error('Cannot purge messages in this channel');
      }

      const messages = await channel.getMessages({ limit: amount });
      await channel.deleteMessages(messages.map(m => m.id));

      await interaction.editOriginal({
        content: `✅ Deleted ${messages.length} message(s)`
      });

    } catch (error) {
      this.client.logger.error('Purge error:', error);
      await interaction.editOriginal({
        content: '❌ Failed to purge messages'
      });
    }
  }
}
```

---

**Next Steps:**
- [Creating Events](./creating-events.md)
- [Creating Modules](./creating-modules.md)
- [API Reference](../api/README.md)
