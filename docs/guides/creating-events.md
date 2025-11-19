# Creating Events Guide

Learn how to create event handlers to respond to Discord events.

## Quick Start

### 1. Create Event File

```
src/modules/general/events/MessageCreate.event.ts
```

### 2. Basic Event Template

```typescript
import { Message } from 'oceanic.js';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';

@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    this.client.logger.info(`Message from ${message.author.username}: ${message.content}`);
  }
}
```

### 3. Register in Module

```typescript
// src/modules/general/General.module.ts
import { MessageCreateEvent } from './events/MessageCreate.event';

export class GeneralModule extends BaseModule {
  async initialize(client: ExtendedClient): Promise<void> {
    await this.registerEvents([
      ReadyEvent,
      MessageCreateEvent  // Add your event
    ]);
  }
}
```

## Common Discord Events

### ready

Fired when the bot is fully ready.

```typescript
@Event('ready')
@Once()
export class ReadyEvent extends BaseEvent {
  async execute(): Promise<void> {
    this.client.logger.info(`Logged in as ${this.client.user.tag}`);
    this.client.logger.info(`Serving ${this.client.guilds.size} guilds`);
  }
}
```

### messageCreate

Fired when a message is sent.

```typescript
@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    // Auto-respond to certain messages
    if (message.content.toLowerCase().includes('hello bot')) {
      await message.channel.createMessage({
        content: `Hello, ${message.author.mention}!`
      });
    }
  }
}
```

### guildMemberAdd

Fired when a user joins a server.

```typescript
import { Member } from 'oceanic.js';

@Event('guildMemberAdd')
export class GuildMemberAddEvent extends BaseEvent {
  async execute(member: Member): Promise<void> {
    this.client.logger.info(`${member.user.tag} joined ${member.guild.name}`);

    // Send welcome message
    const welcomeChannel = member.guild.channels.get('CHANNEL_ID');
    if (welcomeChannel && 'createMessage' in welcomeChannel) {
      await welcomeChannel.createMessage({
        content: `Welcome ${member.mention} to ${member.guild.name}! 🎉`
      });
    }

    // Auto-assign role
    try {
      await member.addRole('ROLE_ID', 'Auto-assigned member role');
    } catch (error) {
      this.client.logger.error('Failed to assign role:', error);
    }
  }
}
```

### guildMemberRemove

Fired when a user leaves a server.

```typescript
import { Member } from 'oceanic.js';

@Event('guildMemberRemove')
export class GuildMemberRemoveEvent extends BaseEvent {
  async execute(member: Member): Promise<void> {
    this.client.logger.info(`${member.user.tag} left ${member.guild.name}`);

    const logChannel = member.guild.channels.get('LOG_CHANNEL_ID');
    if (logChannel && 'createMessage' in logChannel) {
      await logChannel.createMessage({
        embeds: [
          EmbedBuilder.info('Member Left', '')
            .addField('User', member.user.tag, true)
            .addField('ID', member.user.id, true)
            .addField('Joined At', member.joinedAt?.toDateString() ?? 'Unknown', false)
            .setTimestamp()
            .build()
        ]
      });
    }
  }
}
```

### More Events

```typescript
// Message updated
@Event('messageUpdate')
export class MessageUpdateEvent extends BaseEvent {
  async execute(message: Message, oldMessage: Message | null): Promise<void> {
    // Handle edited messages
  }
}

// Message deleted
@Event('messageDelete')
export class MessageDeleteEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    // Handle deleted messages
  }
}

// Guild created (bot joins server)
@Event('guildCreate')
export class GuildCreateEvent extends BaseEvent {
  async execute(guild: Guild): Promise<void> {
    this.client.logger.info(`Joined guild: ${guild.name}`);
  }
}

// Voice state update
@Event('voiceStateUpdate')
export class VoiceStateUpdateEvent extends BaseEvent {
  async execute(member: Member, oldState: VoiceState): Promise<void> {
    // Handle voice channel joins/leaves
  }
}

// Reaction added
@Event('messageReactionAdd')
export class MessageReactionAddEvent extends BaseEvent {
  async execute(message: Message, reactor: User, reaction: Reaction): Promise<void> {
    // Handle reactions
  }
}
```

## Using Database in Events

```typescript
import { inject } from 'tsyringe';
import { DatabaseService } from '@database/DatabaseService';
import { Member } from 'oceanic.js';

@Event('guildMemberAdd')
export class WelcomeEvent extends BaseEvent {
  constructor(
    client: ExtendedClient,
    @inject(DatabaseService) private db: DatabaseService
  ) {
    super(client);
  }

  async execute(member: Member): Promise<void> {
    // Get or create user in database
    const user = await this.db.user.upsert({
      where: { id: member.user.id },
      create: {
        id: member.user.id,
        username: member.user.username,
        discriminator: member.user.discriminator
      },
      update: {
        username: member.user.username,
        discriminator: member.user.discriminator
      }
    });

    this.client.logger.info(`User ${user.username} joined (DB ID: ${user.id})`);
  }
}
```

## Error Handling

```typescript
@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    try {
      // Event logic that might fail
      await this.processMessage(message);
    } catch (error) {
      this.client.logger.error('Error in messageCreate event:', error);
      // Don't crash the bot on event errors
    }
  }

  private async processMessage(message: Message): Promise<void> {
    // Processing logic
  }
}
```

## Best Practices

### 1. Use @Once for One-Time Events

```typescript
@Event('ready')
@Once()
export class ReadyEvent extends BaseEvent {
  // This only runs once when bot starts
}
```

### 2. Filter Early

```typescript
@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    // Filter out bots immediately
    if (message.author.bot) return;

    // Filter out DMs if not needed
    if (!message.guildID) return;

    // Now process the message
  }
}
```

### 3. Don't Block Event Loop

```typescript
// Bad: Blocks the event loop
@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    // This blocks other events from processing!
    await this.slowDatabaseQuery();
  }
}

// Good: Process asynchronously
@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    // Process in background
    this.processMessageAsync(message).catch(error => {
      this.client.logger.error('Background processing error:', error);
    });
  }

  private async processMessageAsync(message: Message): Promise<void> {
    await this.slowDatabaseQuery();
  }
}
```

### 4. Log Important Events

```typescript
this.client.logger.info('Event occurred:', eventData);
this.client.logger.warn('Unexpected event data');
this.client.logger.error('Event processing failed:', error);
```

---

**Next:**
- [Creating Modules](./creating-modules.md)
- [Middleware Guide](./middleware.md)
