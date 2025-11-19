# BaseCommand API

Abstract base class that all commands must extend.

## Import

```typescript
import { BaseCommand } from '@core/base';
```

## Class Definition

```typescript
export abstract class BaseCommand {
  public name: string;
  public description: string;
  public options: ApplicationCommandOption[];
  public permissions: string[];
  public guildOnly: boolean;
  public dmOnly: boolean;
  public ownerOnly: boolean;
  public cooldown: number;

  constructor(public client: ExtendedClient);

  abstract execute(interaction: CommandInteraction): Promise<void>;

  canExecute(interaction: CommandInteraction): boolean;
}
```

## Properties

### name
- **Type:** `string`
- **Description:** Command name (set by `@Command` decorator)
- **Read-only:** Set via decorator, should not be modified

### description
- **Type:** `string`
- **Description:** Command description shown in Discord (set by `@Command` decorator)
- **Read-only:** Set via decorator, should not be modified

### options
- **Type:** `ApplicationCommandOption[]`
- **Description:** Array of command options/parameters (set by `@Option` decorators)
- **Default:** `[]`

### permissions
- **Type:** `string[]`
- **Description:** Required permissions (set by `@RequirePermissions` decorator)
- **Default:** `[]`

### guildOnly
- **Type:** `boolean`
- **Description:** Whether command can only be used in guilds (set by `@GuildOnly` decorator)
- **Default:** `false`

### dmOnly
- **Type:** `boolean`
- **Description:** Whether command can only be used in DMs (set by `@DMOnly` decorator)
- **Default:** `false`

### ownerOnly
- **Type:** `boolean`
- **Description:** Whether command is restricted to bot owner (set by `@OwnerOnly` decorator)
- **Default:** `false`

### cooldown
- **Type:** `number`
- **Description:** Cooldown duration in milliseconds (set by `@Cooldown` decorator)
- **Default:** `0` (no cooldown)

### client
- **Type:** `ExtendedClient`
- **Description:** Reference to the bot client
- **Access:** Available in all command methods via `this.client`

## Methods

### execute()

**Abstract method** that must be implemented by all commands. Contains the command's logic.

**Signature:**
```typescript
abstract execute(interaction: CommandInteraction): Promise<void>
```

**Parameters:**
- `interaction: CommandInteraction` - The command interaction from Discord

**Returns:** `Promise<void>`

**Example:**
```typescript
async execute(interaction: CommandInteraction): Promise<void> {
  await interaction.createMessage({
    content: 'Hello, World!'
  });
}
```

### canExecute()

Checks whether the command can be executed by the user in the current context.

**Signature:**
```typescript
canExecute(interaction: CommandInteraction): boolean
```

**Parameters:**
- `interaction: CommandInteraction` - The command interaction to check

**Returns:** `boolean` - `true` if command can execute, `false` otherwise

**Checks performed:**
1. Owner-only restriction
2. Guild-only restriction
3. DM-only restriction
4. Permission requirements
5. Cooldown status

**Example:**
```typescript
if (!command.canExecute(interaction)) {
  await interaction.createMessage({
    content: 'You cannot execute this command!',
    flags: MessageFlags.EPHEMERAL
  });
  return;
}
```

**Note:** This is typically called automatically by the interaction handler. You usually don't need to call it manually.

## Usage Example

### Basic Command

```typescript
import { CommandInteraction } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command } from '@core/decorators';

@Command('ping', 'Check bot latency')
export class PingCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const latency = Date.now() - interaction.createdAt.getTime();

    await interaction.createMessage({
      content: `Pong! Latency: ${latency}ms`
    });
  }
}
```

### With Options

```typescript
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, Option } from '@core/decorators';

@Command('echo', 'Repeat a message')
@Option({
  name: 'message',
  description: 'Message to repeat',
  type: ApplicationCommandOptionTypes.STRING,
  required: true
})
export class EchoCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const message = interaction.data.options.getString('message', true);

    await interaction.createMessage({
      content: message
    });
  }
}
```

### With Permissions and Guards

```typescript
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, Option, RequirePermissions, GuildOnly, Cooldown } from '@core/decorators';

@Command('kick', 'Kick a user from the server')
@Option({
  name: 'user',
  description: 'User to kick',
  type: ApplicationCommandOptionTypes.USER,
  required: true
})
@Option({
  name: 'reason',
  description: 'Reason for kick',
  type: ApplicationCommandOptionTypes.STRING,
  required: false
})
@RequirePermissions('KICK_MEMBERS')
@GuildOnly()
@Cooldown(3000)
export class KickCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user', true);
    const reason = interaction.data.options.getString('reason') ?? 'No reason provided';

    try {
      await interaction.guild!.createKick(user.id, reason);

      await interaction.createMessage({
        content: `Successfully kicked ${user.mention}`
      });
    } catch (error) {
      this.client.logger.error('Kick command error:', error);

      await interaction.createMessage({
        content: 'Failed to kick user. Make sure the bot has proper permissions.',
        flags: MessageFlags.EPHEMERAL
      });
    }
  }
}
```

### Using Dependency Injection

```typescript
import { inject } from 'tsyringe';
import { CommandInteraction } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command } from '@core/decorators';
import { DatabaseService } from '@database/DatabaseService';
import { EmbedBuilder } from '@common/builders';

@Command('stats', 'View server statistics')
@GuildOnly()
export class StatsCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    @inject(DatabaseService) private db: DatabaseService
  ) {
    super(client);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const guildData = await this.db.guild.findUnique({
      where: { id: interaction.guildID! },
      include: {
        _count: {
          select: {
            warnings: true,
            bans: true
          }
        }
      }
    });

    const embed = EmbedBuilder.info('Server Statistics', '')
      .addField('Total Warnings', guildData?._count.warnings.toString() ?? '0', true)
      .addField('Total Bans', guildData?._count.bans.toString() ?? '0', true)
      .setTimestamp()
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

### Deferred Response

For long-running commands:

```typescript
@Command('process', 'Process large dataset')
export class ProcessCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Defer the response (shows "Bot is thinking...")
    await interaction.defer();

    // Perform long operation
    const result = await this.performLongOperation();

    // Edit the deferred response
    await interaction.editOriginal({
      content: `Processing complete! Result: ${result}`
    });
  }

  private async performLongOperation(): Promise<string> {
    // Simulate long operation
    await new Promise(resolve => setTimeout(resolve, 5000));
    return 'Success';
  }
}
```

### Ephemeral Responses

For private responses (only visible to the user):

```typescript
import { MessageFlags } from 'oceanic.js';

@Command('secret', 'Get a secret message')
export class SecretCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: 'This message is only visible to you!',
      flags: MessageFlags.EPHEMERAL
    });
  }
}
```

## Best Practices

### 1. Error Handling

Always use try-catch blocks in execute methods:

```typescript
async execute(interaction: CommandInteraction): Promise<void> {
  try {
    // Command logic
  } catch (error) {
    this.client.logger.error('Command error:', error);

    await interaction.createMessage({
      embeds: [
        EmbedBuilder.error('Error', 'An error occurred').build()
      ],
      flags: MessageFlags.EPHEMERAL
    });
  }
}
```

### 2. Use Type Safety

Use typed option getters with `required` parameter:

```typescript
// Good: Type-safe, will never be null
const user = interaction.data.options.getUser('user', true);

// Bad: Could be null, need to handle
const user = interaction.data.options.getUser('user');
if (!user) return;
```

### 3. Validate Input

Even with Discord's built-in validation, add additional checks:

```typescript
const amount = interaction.data.options.getInteger('amount', true);

if (amount < 1 || amount > 1000) {
  await interaction.createMessage({
    content: 'Amount must be between 1 and 1000',
    flags: MessageFlags.EPHEMERAL
  });
  return;
}
```

### 4. Use Logger

Log important actions and errors:

```typescript
this.client.logger.info(`User ${interaction.user.tag} executed ${this.name}`);
this.client.logger.error('Error in command:', error);
this.client.logger.debug('Debug info:', data);
```

### 5. Clean Up Resources

If you allocate resources, clean them up:

```typescript
async execute(interaction: CommandInteraction): Promise<void> {
  const collector = interaction.channel.createMessageCollector({
    filter: m => m.author.id === interaction.user.id,
    time: 30000
  });

  try {
    // Use collector
  } finally {
    collector.stop();
  }
}
```

## Common Patterns

### Pagination

```typescript
import { ComponentBuilder, EmbedBuilder } from '@common/builders';

async execute(interaction: CommandInteraction): Promise<void> {
  let page = 0;
  const pages = this.generatePages();

  const message = await interaction.createMessage({
    embeds: [pages[page]],
    components: [
      ComponentBuilder.actionRow([
        ComponentBuilder.button('secondary', 'prev', 'Previous'),
        ComponentBuilder.button('secondary', 'next', 'Next')
      ])
    ]
  });

  // Add button collector for pagination
}
```

### Confirmation

```typescript
async execute(interaction: CommandInteraction): Promise<void> {
  await interaction.createMessage({
    content: 'Are you sure you want to delete all data?',
    components: [
      ComponentBuilder.actionRow([
        ComponentBuilder.button('danger', 'confirm', 'Confirm'),
        ComponentBuilder.button('secondary', 'cancel', 'Cancel')
      ])
    ]
  });

  // Wait for button click
}
```

---

**Related:**
- [Decorators API](./decorators.md)
- [Creating Commands Guide](../guides/creating-commands.md)
- [ExtendedClient API](./extended-client.md)
