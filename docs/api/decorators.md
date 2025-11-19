# Decorators API

Complete reference for all decorators available in the Discord Bot Template.

## Command Decorators

### @Command

Defines a slash command.

**Signature:**
```typescript
@Command(name: string, description: string)
```

**Parameters:**
- `name` - Command name (lowercase, no spaces, 1-32 characters)
- `description` - Command description (1-100 characters)

**Example:**
```typescript
@Command('ping', 'Check bot latency')
export class PingCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({ content: 'Pong!' });
  }
}
```

---

### @Option

Adds an option/parameter to a command.

**Signature:**
```typescript
@Option(config: OptionConfig)
```

**OptionConfig Properties:**
- `name` (required) - Option name
- `description` (required) - Option description
- `type` (required) - Option type (from `ApplicationCommandOptionTypes`)
- `required` (optional) - Whether the option is required (default: false)
- `choices` (optional) - Array of predefined choices
- `autocomplete` (optional) - Enable autocomplete (default: false)
- `min_value` (optional) - Minimum value (for numbers)
- `max_value` (optional) - Maximum value (for numbers)
- `min_length` (optional) - Minimum length (for strings)
- `max_length` (optional) - Maximum length (for strings)

**Option Types:**
```typescript
import { ApplicationCommandOptionTypes } from 'oceanic.js';

ApplicationCommandOptionTypes.STRING       // Text input
ApplicationCommandOptionTypes.INTEGER      // Whole number
ApplicationCommandOptionTypes.NUMBER       // Decimal number
ApplicationCommandOptionTypes.BOOLEAN      // True/false
ApplicationCommandOptionTypes.USER         // Discord user
ApplicationCommandOptionTypes.CHANNEL      // Discord channel
ApplicationCommandOptionTypes.ROLE         // Discord role
ApplicationCommandOptionTypes.MENTIONABLE  // User or role
ApplicationCommandOptionTypes.ATTACHMENT   // File attachment
```

**Examples:**

Basic string option:
```typescript
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

Number with min/max:
```typescript
@Command('roll', 'Roll a dice')
@Option({
  name: 'sides',
  description: 'Number of sides',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: false,
  min_value: 2,
  max_value: 100
})
export class RollCommand extends BaseCommand { }
```

With choices:
```typescript
@Option({
  name: 'game',
  description: 'Choose a game',
  type: ApplicationCommandOptionTypes.STRING,
  required: true,
  choices: [
    { name: 'Minecraft', value: 'minecraft' },
    { name: 'Fortnite', value: 'fortnite' },
    { name: 'Among Us', value: 'among_us' }
  ]
})
```

Multiple options:
```typescript
@Command('ban', 'Ban a user')
@Option({
  name: 'user',
  description: 'User to ban',
  type: ApplicationCommandOptionTypes.USER,
  required: true
})
@Option({
  name: 'reason',
  description: 'Reason for ban',
  type: ApplicationCommandOptionTypes.STRING,
  required: false,
  max_length: 512
})
@Option({
  name: 'days',
  description: 'Days of messages to delete',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: false,
  min_value: 0,
  max_value: 7
})
export class BanCommand extends BaseCommand { }
```

---

### @RequirePermissions

Requires specific Discord permissions to execute the command.

**Signature:**
```typescript
@RequirePermissions(...permissions: PermissionName[])
```

**Parameters:**
- `permissions` - One or more permission strings

**Common Permissions:**
- `ADMINISTRATOR`
- `MANAGE_GUILD`
- `MANAGE_ROLES`
- `MANAGE_CHANNELS`
- `KICK_MEMBERS`
- `BAN_MEMBERS`
- `MANAGE_MESSAGES`
- `MENTION_EVERYONE`
- `VIEW_AUDIT_LOG`
- `MODERATE_MEMBERS`

**Examples:**

Single permission:
```typescript
@Command('kick', 'Kick a user')
@RequirePermissions('KICK_MEMBERS')
export class KickCommand extends BaseCommand { }
```

Multiple permissions:
```typescript
@Command('setup', 'Setup the bot')
@RequirePermissions('ADMINISTRATOR', 'MANAGE_GUILD')
export class SetupCommand extends BaseCommand { }
```

---

### @GuildOnly

Restricts command to guild (server) contexts only.

**Signature:**
```typescript
@GuildOnly()
```

**Example:**
```typescript
@Command('ban', 'Ban a user')
@GuildOnly()
export class BanCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // This will only run in guilds, never in DMs
  }
}
```

---

### @DMOnly

Restricts command to DM contexts only.

**Signature:**
```typescript
@DMOnly()
```

**Example:**
```typescript
@Command('profile', 'View your profile')
@DMOnly()
export class ProfileCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // This will only run in DMs, never in guilds
  }
}
```

---

### @OwnerOnly

Restricts command to the bot owner only (specified in `OWNER_ID` env variable).

**Signature:**
```typescript
@OwnerOnly()
```

**Example:**
```typescript
@Command('shutdown', 'Shut down the bot')
@OwnerOnly()
export class ShutdownCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({ content: 'Shutting down...' });
    process.exit(0);
  }
}
```

---

### @Cooldown

Adds a cooldown period between command uses per user.

**Signature:**
```typescript
@Cooldown(milliseconds: number)
```

**Parameters:**
- `milliseconds` - Cooldown duration in milliseconds

**Example:**
```typescript
@Command('search', 'Search the web')
@Cooldown(10000)  // 10 second cooldown
export class SearchCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Users must wait 10 seconds between uses
  }
}
```

**Cooldown Helpers:**
```typescript
const SECOND = 1000;
const MINUTE = 60 * 1000;
const HOUR = 60 * 60 * 1000;

@Cooldown(5 * SECOND)   // 5 seconds
@Cooldown(2 * MINUTE)   // 2 minutes
@Cooldown(1 * HOUR)     // 1 hour
```

---

### @UseMiddleware

Applies middleware to a command.

**Signature:**
```typescript
@UseMiddleware(...middlewares: MiddlewareConstructor[])
```

**Parameters:**
- `middlewares` - One or more middleware classes

**Example:**
```typescript
import { RateLimitMiddleware } from '@common/middleware';

@Command('api', 'Call external API')
@UseMiddleware(RateLimitMiddleware)
export class ApiCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Middleware runs before this
  }
}
```

Multiple middlewares (run in order):
```typescript
@Command('premium', 'Premium feature')
@UseMiddleware(AuthMiddleware, PremiumCheckMiddleware, LoggingMiddleware)
export class PremiumCommand extends BaseCommand { }
```

---

## Event Decorators

### @Event

Defines an event handler.

**Signature:**
```typescript
@Event(eventName: string)
```

**Parameters:**
- `eventName` - Name of the Discord event (from Oceanic.js events)

**Common Events:**
- `ready` - Bot is ready
- `messageCreate` - Message was created
- `messageUpdate` - Message was edited
- `messageDelete` - Message was deleted
- `guildMemberAdd` - Member joined a guild
- `guildMemberRemove` - Member left a guild
- `guildCreate` - Bot joined a guild
- `guildDelete` - Bot left a guild
- `interactionCreate` - Interaction was created
- `voiceChannelJoin` - User joined voice channel
- `voiceChannelLeave` - User left voice channel

**Example:**
```typescript
@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    this.client.logger.info(`Message from ${message.author.username}`);
  }
}
```

---

### @Once

Event handler executes only once.

**Signature:**
```typescript
@Once()
```

**Example:**
```typescript
@Event('ready')
@Once()
export class ReadyEvent extends BaseEvent {
  async execute(): Promise<void> {
    this.client.logger.info('Bot is ready!');
    // This will only execute once when bot starts
  }
}
```

---

## Combining Decorators

Decorators can be stacked to combine functionality:

**Full Example:**
```typescript
import { CommandInteraction } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import {
  Command,
  Option,
  RequirePermissions,
  GuildOnly,
  Cooldown,
  UseMiddleware
} from '@core/decorators';
import { ApplicationCommandOptionTypes } from 'oceanic.js';
import { LoggingMiddleware } from '@common/middleware';

@Command('ban', 'Ban a user from the server')
@Option({
  name: 'user',
  description: 'User to ban',
  type: ApplicationCommandOptionTypes.USER,
  required: true
})
@Option({
  name: 'reason',
  description: 'Reason for ban',
  type: ApplicationCommandOptionTypes.STRING,
  required: false,
  max_length: 512
})
@Option({
  name: 'days',
  description: 'Days of messages to delete (0-7)',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: false,
  min_value: 0,
  max_value: 7
})
@RequirePermissions('BAN_MEMBERS')
@GuildOnly()
@Cooldown(3000)
@UseMiddleware(LoggingMiddleware)
export class BanCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user', true);
    const reason = interaction.data.options.getString('reason') ?? 'No reason provided';
    const days = interaction.data.options.getInteger('days') ?? 0;

    await interaction.guild!.createBan(user.id, {
      deleteMessageSeconds: days * 24 * 60 * 60,
      reason
    });

    await interaction.createMessage({
      content: `Banned ${user.mention} for: ${reason}`
    });
  }
}
```

---

## Decorator Execution Order

When multiple decorators are used:

1. **Middleware** (`@UseMiddleware`) - Runs first
2. **Guards** - Run in this order:
   - `@OwnerOnly`
   - `@RequirePermissions`
   - `@GuildOnly` / `@DMOnly`
   - `@Cooldown`
3. **Command Execution** - `execute()` method runs

If any step fails, execution stops and an error is returned.

---

## Creating Custom Decorators

You can create your own decorators:

```typescript
import 'reflect-metadata';

const METADATA_KEY = 'custom:decorator';

export function MyCustomDecorator(value: string) {
  return function (target: any) {
    Reflect.defineMetadata(METADATA_KEY, value, target);
  };
}

// Usage
@Command('test', 'Test command')
@MyCustomDecorator('my-value')
export class TestCommand extends BaseCommand { }

// Reading metadata
const value = Reflect.getMetadata(METADATA_KEY, TestCommand);
```

---

For more examples, see the [Examples Directory](../examples/).
