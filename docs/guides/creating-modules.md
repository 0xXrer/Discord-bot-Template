# Creating Modules Guide

Modules are the primary way to organize and group related commands, events, and services in the Discord Bot Template v2.0.

## What is a Module?

A module is a self-contained unit that:
- Groups related commands together
- Manages event listeners
- Handles initialization and shutdown logic
- Can have its own services and dependencies

## Basic Module Structure

```typescript
import { injectable } from 'tsyringe';
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';
import { Container } from '@core/container';

@injectable()
export class MyModule extends BaseModule {
  public name = 'MyModule';

  constructor(client: ExtendedClient) {
    super(client);
  }

  public async initialize(client: ExtendedClient): Promise<void> {
    client.logger.info(`Initializing ${this.name} module...`);

    // Load commands
    const commands = [
      Container.get(Command1),
      Container.get(Command2),
    ];

    // Load events
    const events = [
      Container.get(Event1),
      Container.get(Event2),
    ];

    // Register with client
    commands.forEach((cmd) => client.registerCommand(cmd));
    events.forEach((evt) => client.registerEvent(evt));

    client.logger.info(`${this.name} module initialized`);
  }

  public async shutdown(): Promise<void> {
    // Optional cleanup logic
    this.client.logger.info(`${this.name} module shutting down...`);
  }
}
```

## Creating a Complete Module

Let's create a "Utility" module with some useful commands:

### 1. Create Module Directory

```
src/modules/utility/
├── commands/
│   ├── AvatarCommand.ts
│   ├── ServerInfoCommand.ts
│   └── UptimeCommand.ts
├── events/
│   └── (optional)
└── utility.module.ts
```

### 2. Create Commands

**AvatarCommand.ts:**
```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('avatar', 'Get a user\'s avatar')
@Cooldown(3000)
@injectable()
export class AvatarCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    this.metadata.options = [
      {
        type: 6, // USER
        name: 'user',
        description: 'The user to get avatar from',
        required: false,
      },
    ];
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = true;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const targetUser = interaction.data.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Avatar`)
      .setImage(targetUser.avatarURL('png', 512))
      .setColor('#5865F2')
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

**ServerInfoCommand.ts:**
```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, GuildOnly, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('serverinfo', 'Get information about the server')
@GuildOnly()
@Cooldown(5000)
@injectable()
export class ServerInfoCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const guild = interaction.guild;
    if (!guild) return;

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL() || '')
      .addField('Owner', `<@${guild.ownerID}>`, true)
      .addField('Members', guild.memberCount.toString(), true)
      .addField('Channels', guild.channels.size.toString(), true)
      .addField('Roles', guild.roles.size.toString(), true)
      .addField('Created', guild.createdAt.toISOString().split('T')[0], true)
      .setColor('#5865F2')
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

**UptimeCommand.ts:**
```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('uptime', 'Check how long the bot has been running')
@Cooldown(5000)
@injectable()
export class UptimeCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = true;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const uptime = this.formatUptime(process.uptime());

    const embed = EmbedBuilder.info('Bot Uptime', `The bot has been running for **${uptime}**`)
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
```

### 3. Create Module File

**utility.module.ts:**
```typescript
import { injectable } from 'tsyringe';
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';
import { Container } from '@core/container';

import { AvatarCommand } from './commands/AvatarCommand';
import { ServerInfoCommand } from './commands/ServerInfoCommand';
import { UptimeCommand } from './commands/UptimeCommand';

@injectable()
export class UtilityModule extends BaseModule {
  public name = 'Utility';

  constructor(client: ExtendedClient) {
    super(client);
  }

  public async initialize(client: ExtendedClient): Promise<void> {
    client.logger.info(`Initializing ${this.name} module...`);

    const commands = [
      Container.get(AvatarCommand),
      Container.get(ServerInfoCommand),
      Container.get(UptimeCommand),
    ];

    commands.forEach((command) => client.registerCommand(command));

    client.logger.info(
      `${this.name} module initialized with ${commands.length} commands`
    );
  }

  public async shutdown(): Promise<void> {
    this.client.logger.info(`${this.name} module shutting down...`);
    // Cleanup logic here if needed
  }
}
```

### 4. Register Module in main.ts

Update `src/main.ts` to include your new module:

```typescript
import { UtilityModule } from '@modules/utility/utility.module';

async function bootstrap(): Promise<void> {
  // ... existing code ...

  const utilityModule = container.resolve(UtilityModule);
  await utilityModule.initialize(client);
  client.registerModule(utilityModule);

  // ... rest of code ...
}
```

## Module with Services

Modules can have their own services:

```typescript
// src/modules/economy/services/EconomyService.ts
import { singleton } from 'tsyringe';
import { DatabaseService } from '@database/database.service';
import { Logger } from '@common/logger';

@singleton()
export class EconomyService {
  constructor(
    private database: DatabaseService,
    private logger: Logger
  ) {}

  public async addMoney(userId: string, amount: number): Promise<void> {
    // Implementation
  }

  public async getMoney(userId: string): Promise<number> {
    // Implementation
    return 0;
  }
}

// In module
import { EconomyService } from './services/EconomyService';

export class EconomyModule extends BaseModule {
  constructor(
    client: ExtendedClient,
    private economyService: EconomyService
  ) {
    super(client);
  }

  // ... rest of module
}
```

## Module Configuration

Modules can have their own configuration:

```typescript
interface UtilityModuleConfig {
  maxAvatarSize: number;
  cacheEnabled: boolean;
}

export class UtilityModule extends BaseModule {
  private config: UtilityModuleConfig;

  constructor(client: ExtendedClient) {
    super(client);
    this.config = {
      maxAvatarSize: 512,
      cacheEnabled: true,
    };
  }

  // Access config in commands via module reference
}
```

## Best Practices

1. **One module per feature** - Keep modules focused on a single feature set
2. **Use dependency injection** - Makes modules testable
3. **Implement shutdown** - Clean up resources properly
4. **Group related commands** - Commands in a module should be related
5. **Use services for business logic** - Keep commands thin, services thick
6. **Handle errors** - Always wrap module initialization in try-catch
7. **Log initialization** - Help with debugging
8. **Make modules independent** - Modules should not depend on each other directly

## Module Loading Order

Modules are loaded in the order they're initialized in `main.ts`. If you have dependencies between modules, load them in the correct order:

```typescript
// Load core modules first
const generalModule = container.resolve(GeneralModule);
await generalModule.initialize(client);

// Then feature modules
const economyModule = container.resolve(EconomyModule);
await economyModule.initialize(client);

// Finally, dependent modules
const shopModule = container.resolve(ShopModule); // Depends on Economy
await shopModule.initialize(client);
```

## Testing Modules

Create tests for your modules:

```typescript
// src/modules/utility/__tests__/utility.module.test.ts
import { UtilityModule } from '../utility.module';
import { ExtendedClient } from '@core/client';

describe('UtilityModule', () => {
  let module: UtilityModule;
  let mockClient: jest.Mocked<ExtendedClient>;

  beforeEach(() => {
    mockClient = {
      registerCommand: jest.fn(),
      registerEvent: jest.fn(),
      logger: {
        info: jest.fn(),
      },
    } as any;

    module = new UtilityModule(mockClient);
  });

  it('should initialize with correct name', () => {
    expect(module.name).toBe('Utility');
  });

  it('should register commands on initialize', async () => {
    await module.initialize(mockClient);
    expect(mockClient.registerCommand).toHaveBeenCalledTimes(3);
  });
});
```
