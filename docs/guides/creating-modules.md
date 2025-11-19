# Creating Modules Guide

Learn how to organize your bot's features into modular, maintainable packages.

## What are Modules?

Modules are self-contained packages of related functionality that group commands, events, and services together. They make your bot organized, testable, and easy to maintain.

## Module Structure

```
src/modules/mymodule/
├── commands/
│   ├── Command1.command.ts
│   └── Command2.command.ts
├── events/
│   └── Event1.event.ts
├── services/
│   └── MyService.ts
└── MyModule.module.ts
```

## Creating a Module

### 1. Create Module Directory

```bash
mkdir -p src/modules/mymodule/commands
mkdir -p src/modules/mymodule/events
```

### 2. Create Module Class

```typescript
// src/modules/mymodule/MyModule.module.ts
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';

export class MyModule extends BaseModule {
  public name = 'MyModule';
  public description = 'Description of what this module does';

  async initialize(client: ExtendedClient): Promise<void> {
    // Register commands
    await this.registerCommands([
      // Add your command classes here
    ]);

    // Register events
    await this.registerEvents([
      // Add your event classes here
    ]);

    this.client.logger.info(`${this.name} initialized`);
  }

  async shutdown(): Promise<void> {
    // Clean up resources
    this.client.logger.info(`${this.name} shut down`);
  }
}
```

### 3. Register in Main

```typescript
// src/main.ts
import { MyModule } from './modules/mymodule/MyModule.module';

async function bootstrap() {
  const client = new ExtendedClient();

  // Register modules
  client.registerModule(new GeneralModule(client));
  client.registerModule(new ModerationModule(client));
  client.registerModule(new MyModule(client));  // Add your module

  await client.login(process.env.BOT_TOKEN);
}
```

## Complete Example: Economy Module

### Module Structure

```
src/modules/economy/
├── commands/
│   ├── Balance.command.ts
│   ├── Daily.command.ts
│   └── Transfer.command.ts
├── events/
│   └── MessageReward.event.ts
├── services/
│   └── EconomyService.ts
└── Economy.module.ts
```

### EconomyService

```typescript
// src/modules/economy/services/EconomyService.ts
import { singleton, inject } from 'tsyringe';
import { DatabaseService } from '@database/DatabaseService';

@singleton()
export class EconomyService {
  constructor(
    @inject(DatabaseService) private db: DatabaseService
  ) {}

  async getBalance(userId: string): Promise<number> {
    const user = await this.db.user.findUnique({
      where: { id: userId }
    });
    return user?.balance ?? 0;
  }

  async addBalance(userId: string, amount: number): Promise<number> {
    const user = await this.db.user.upsert({
      where: { id: userId },
      create: { id: userId, balance: amount },
      update: { balance: { increment: amount } }
    });
    return user.balance;
  }

  async transfer(fromId: string, toId: string, amount: number): Promise<boolean> {
    const from = await this.getBalance(fromId);
    if (from < amount) return false;

    await this.db.$transaction([
      this.db.user.update({
        where: { id: fromId },
        data: { balance: { decrement: amount } }
      }),
      this.db.user.update({
        where: { id: toId },
        data: { balance: { increment: amount } }
      })
    ]);

    return true;
  }
}
```

### Balance Command

```typescript
// src/modules/economy/commands/Balance.command.ts
import { inject } from 'tsyringe';
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, Option } from '@core/decorators';
import { EconomyService } from '../services/EconomyService';
import { EmbedBuilder } from '@common/builders';

@Command('balance', 'Check your or someone elses balance')
@Option({
  name: 'user',
  description: 'User to check balance of',
  type: ApplicationCommandOptionTypes.USER,
  required: false
})
export class BalanceCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    @inject(EconomyService) private economyService: EconomyService
  ) {
    super(client);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user') ?? interaction.user;
    const balance = await this.economyService.getBalance(user.id);

    const embed = EmbedBuilder.info('Balance', '')
      .setThumbnail(user.avatarURL())
      .addField('User', user.tag, true)
      .addField('Balance', `$${balance.toLocaleString()}`, true)
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

### Daily Command

```typescript
// src/modules/economy/commands/Daily.command.ts
import { inject } from 'tsyringe';
import { CommandInteraction, MessageFlags } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { EconomyService } from '../services/EconomyService';

const ONE_DAY = 24 * 60 * 60 * 1000;

@Command('daily', 'Claim your daily reward')
@Cooldown(ONE_DAY)
export class DailyCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    @inject(EconomyService) private economyService: EconomyService
  ) {
    super(client);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const reward = 1000;
    const newBalance = await this.economyService.addBalance(
      interaction.user.id,
      reward
    );

    await interaction.createMessage({
      content: `✅ You claimed your daily reward of $${reward}!\nNew balance: $${newBalance.toLocaleString()}`,
      flags: MessageFlags.EPHEMERAL
    });
  }
}
```

### Transfer Command

```typescript
// src/modules/economy/commands/Transfer.command.ts
import { inject } from 'tsyringe';
import { CommandInteraction, ApplicationCommandOptionTypes, MessageFlags } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, Option, Cooldown } from '@core/decorators';
import { EconomyService } from '../services/EconomyService';

@Command('transfer', 'Transfer money to another user')
@Option({
  name: 'user',
  description: 'User to transfer to',
  type: ApplicationCommandOptionTypes.USER,
  required: true
})
@Option({
  name: 'amount',
  description: 'Amount to transfer',
  type: ApplicationCommandOptionTypes.INTEGER,
  required: true,
  min_value: 1
})
@Cooldown(5000)
export class TransferCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    @inject(EconomyService) private economyService: EconomyService
  ) {
    super(client);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const toUser = interaction.data.options.getUser('user', true);
    const amount = interaction.data.options.getInteger('amount', true);

    if (toUser.id === interaction.user.id) {
      await interaction.createMessage({
        content: '❌ You cannot transfer to yourself!',
        flags: MessageFlags.EPHEMERAL
      });
      return;
    }

    if (toUser.bot) {
      await interaction.createMessage({
        content: '❌ You cannot transfer to bots!',
        flags: MessageFlags.EPHEMERAL
      });
      return;
    }

    const success = await this.economyService.transfer(
      interaction.user.id,
      toUser.id,
      amount
    );

    if (!success) {
      await interaction.createMessage({
        content: '❌ Insufficient balance!',
        flags: MessageFlags.EPHEMERAL
      });
      return;
    }

    await interaction.createMessage({
      content: `✅ Transferred $${amount.toLocaleString()} to ${toUser.mention}`
    });
  }
}
```

### Message Reward Event

```typescript
// src/modules/economy/events/MessageReward.event.ts
import { inject } from 'tsyringe';
import { Message } from 'oceanic.js';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';
import { EconomyService } from '../services/EconomyService';

@Event('messageCreate')
export class MessageRewardEvent extends BaseEvent {
  private recentMessages = new Set<string>();

  constructor(
    client: ExtendedClient,
    @inject(EconomyService) private economyService: EconomyService
  ) {
    super(client);
  }

  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;
    if (!message.guildID) return;
    if (message.content.length < 10) return;

    // Prevent spam rewards (1 reward per minute per user)
    const key = `${message.author.id}:${Date.now() / 60000 | 0}`;
    if (this.recentMessages.has(key)) return;
    this.recentMessages.add(key);

    // Clean up old entries
    setTimeout(() => this.recentMessages.delete(key), 60000);

    // Award 1-5 coins per message
    const reward = Math.floor(Math.random() * 5) + 1;
    await this.economyService.addBalance(message.author.id, reward);
  }
}
```

### Economy Module

```typescript
// src/modules/economy/Economy.module.ts
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';
import { container } from 'tsyringe';

import { EconomyService } from './services/EconomyService';
import { BalanceCommand } from './commands/Balance.command';
import { DailyCommand } from './commands/Daily.command';
import { TransferCommand } from './commands/Transfer.command';
import { MessageRewardEvent } from './events/MessageReward.event';

export class EconomyModule extends BaseModule {
  public name = 'EconomyModule';
  public description = 'Virtual currency system';

  async initialize(client: ExtendedClient): Promise<void> {
    // Register service in DI container
    container.register(EconomyService, { useClass: EconomyService });

    // Register commands
    await this.registerCommands([
      BalanceCommand,
      DailyCommand,
      TransferCommand
    ]);

    // Register events
    await this.registerEvents([
      MessageRewardEvent
    ]);

    this.client.logger.info('Economy module initialized');
  }

  async shutdown(): Promise<void> {
    this.client.logger.info('Economy module shut down');
  }
}
```

## Module Best Practices

### 1. Single Responsibility

Each module should handle one domain:

```
✅ Good:
- EconomyModule (handles virtual currency)
- ModerationModule (handles moderation)
- LevelingModule (handles XP and levels)

❌ Bad:
- UtilityModule (too broad, handles everything)
```

### 2. Dependency Injection

Use DI for services:

```typescript
// Good
constructor(
  client: ExtendedClient,
  @inject(MyService) private service: MyService
) {
  super(client);
}

// Bad
constructor(client: ExtendedClient) {
  super(client);
  this.service = new MyService(); // Hard to test
}
```

### 3. Error Handling

Handle errors gracefully:

```typescript
async initialize(client: ExtendedClient): Promise<void> {
  try {
    await this.registerCommands([...]);
    this.client.logger.info('Module initialized');
  } catch (error) {
    this.client.logger.error('Module initialization failed:', error);
    throw error;
  }
}
```

### 4. Clean Up Resources

```typescript
async shutdown(): Promise<void> {
  // Close database connections
  await this.database?.disconnect();

  // Clear intervals/timeouts
  if (this.interval) {
    clearInterval(this.interval);
  }

  // Remove event listeners
  this.emitter?.removeAllListeners();

  this.client.logger.info('Module shut down cleanly');
}
```

## Testing Modules

```typescript
// tests/modules/economy/Economy.module.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { ExtendedClient } from '@core/client';
import { EconomyModule } from '@modules/economy/Economy.module';

describe('EconomyModule', () => {
  let module: EconomyModule;
  let client: ExtendedClient;

  beforeEach(() => {
    client = new ExtendedClient();
    module = new EconomyModule(client);
  });

  it('should initialize successfully', async () => {
    await expect(module.initialize(client)).resolves.not.toThrow();
  });

  it('should register commands', async () => {
    await module.initialize(client);
    expect(client.commands.has('balance')).toBe(true);
    expect(client.commands.has('daily')).toBe(true);
  });
});
```

---

**Next:**
- [Middleware Guide](./middleware.md)
- [Database Integration](./database.md)
- [Testing Guide](../testing.md)
