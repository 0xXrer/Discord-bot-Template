# Architecture Overview

This document explains the architecture and design patterns used in the Discord Bot Template v2.0.

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
  - [Dependency Injection](#dependency-injection)
  - [Decorators](#decorators)
  - [Module System](#module-system)
- [Application Flow](#application-flow)
- [Component Architecture](#component-architecture)

## Design Philosophy

The Discord Bot Template v2.0 is built on these core principles:

### 1. Modularity
Code is organized into self-contained modules that encapsulate related functionality. Each module can be developed, tested, and maintained independently.

### 2. Type Safety
Full TypeScript with strict mode ensures type safety throughout the codebase, catching errors at compile-time rather than runtime.

### 3. Dependency Injection
Uses tsyringe for automatic dependency injection, making code more testable and reducing coupling between components.

### 4. Declarative Programming
Decorators provide a declarative way to define commands, events, and their behaviors, making code more readable and maintainable.

### 5. Separation of Concerns
Each component has a single, well-defined responsibility, following SOLID principles.

## Project Structure

```
Discord-bot-Template/
├── src/
│   ├── core/                    # Core framework
│   │   ├── base/                # Abstract base classes
│   │   │   ├── BaseCommand.ts   # Command base class
│   │   │   ├── BaseEvent.ts     # Event base class
│   │   │   └── BaseModule.ts    # Module base class
│   │   ├── decorators/          # Decorator definitions
│   │   │   ├── Command.decorator.ts     # @Command
│   │   │   ├── Event.decorator.ts       # @Event
│   │   │   ├── Guards.decorator.ts      # @RequirePermissions, etc.
│   │   │   ├── Cooldown.decorator.ts    # @Cooldown
│   │   │   ├── Options.decorator.ts     # @Option
│   │   │   └── Middleware.decorator.ts  # @UseMiddleware
│   │   ├── client/              # Extended Discord client
│   │   │   └── ExtendedClient.ts
│   │   ├── container/           # DI container setup
│   │   │   └── Container.ts
│   │   └── interfaces/          # TypeScript interfaces
│   │       ├── ICommand.ts
│   │       ├── IEvent.ts
│   │       └── IModule.ts
│   ├── modules/                 # Feature modules
│   │   ├── general/             # General commands
│   │   │   ├── commands/
│   │   │   │   ├── Ping.command.ts
│   │   │   │   ├── Help.command.ts
│   │   │   │   └── Info.command.ts
│   │   │   └── General.module.ts
│   │   └── moderation/          # Moderation features
│   │       ├── commands/
│   │       │   ├── Ban.command.ts
│   │       │   ├── Kick.command.ts
│   │       │   └── Warn.command.ts
│   │       ├── events/
│   │       │   └── GuildBanAdd.event.ts
│   │       └── Moderation.module.ts
│   ├── common/                  # Shared utilities
│   │   ├── builders/            # Helper builders
│   │   │   ├── EmbedBuilder.ts
│   │   │   └── ComponentBuilder.ts
│   │   ├── middleware/          # Middleware implementations
│   │   │   ├── RateLimitMiddleware.ts
│   │   │   └── PermissionMiddleware.ts
│   │   ├── logger/              # Logging system
│   │   │   └── Logger.ts
│   │   └── utils/               # Utility functions
│   │       ├── FileUtils.ts
│   │       └── DiscordUtils.ts
│   ├── database/                # Database layer
│   │   ├── DatabaseService.ts
│   │   └── repositories/
│   ├── config/                  # Configuration
│   │   └── Config.ts
│   ├── health/                  # Health checks & metrics
│   │   ├── HealthCheck.ts
│   │   └── MetricsCollector.ts
│   └── main.ts                  # Application entry point
├── prisma/                      # Database schema
│   └── schema.prisma
└── tests/                       # Test files
```

## Core Concepts

### Dependency Injection

The bot uses **tsyringe** for dependency injection, which automatically manages dependencies between classes.

#### How It Works

1. **Container Setup**: The DI container is configured in `src/core/container/Container.ts`
2. **Injectable Classes**: Classes are marked as injectable using decorators
3. **Automatic Resolution**: Dependencies are automatically injected into constructors

#### Example

```typescript
import { singleton, inject } from 'tsyringe';
import { DatabaseService } from '@database/DatabaseService';
import { Logger } from '@common/logger';

@singleton()
export class UserService {
  constructor(
    @inject(DatabaseService) private db: DatabaseService,
    @inject(Logger) private logger: Logger
  ) {}

  async getUser(id: string) {
    this.logger.info(`Fetching user ${id}`);
    return this.db.user.findUnique({ where: { id } });
  }
}
```

#### Benefits

- **Testability**: Easy to mock dependencies in tests
- **Loose Coupling**: Classes don't directly instantiate their dependencies
- **Reusability**: Services can be shared across multiple components
- **Lifecycle Management**: Singleton, transient, and scoped lifetimes

#### Container Lifecycle

```typescript
// Singleton: One instance shared across the application
@singleton()
export class ConfigService { }

// Transient: New instance every time it's injected
@injectable()
export class RequestHandler { }

// Scoped: One instance per scope (not commonly used in Discord bots)
@scoped(Lifecycle.ContainerScoped)
export class SessionManager { }
```

### Decorators

Decorators provide a declarative syntax for defining commands, events, and their behaviors.

#### Command Decorators

##### @Command
Defines a slash command:

```typescript
import { Command } from '@core/decorators';

@Command('ping', 'Check bot latency')
export class PingCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Command logic
  }
}
```

##### @Option
Adds options to a command:

```typescript
import { Command, Option } from '@core/decorators';
import { ApplicationCommandOptionTypes } from 'oceanic.js';

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
  required: false
})
export class BanCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const user = interaction.data.options.getUser('user');
    const reason = interaction.data.options.getString('reason');
    // Ban logic
  }
}
```

##### @RequirePermissions
Adds permission requirements:

```typescript
import { Command, RequirePermissions } from '@core/decorators';

@Command('ban', 'Ban a user')
@RequirePermissions('BAN_MEMBERS')
export class BanCommand extends BaseCommand {
  // Only users with BAN_MEMBERS permission can execute this
}
```

##### @GuildOnly / @DMOnly
Restricts where command can be used:

```typescript
@Command('ban', 'Ban a user')
@GuildOnly()  // Can only be used in servers
export class BanCommand extends BaseCommand { }

@Command('profile', 'View your profile')
@DMOnly()  // Can only be used in DMs
export class ProfileCommand extends BaseCommand { }
```

##### @Cooldown
Adds cooldown to prevent spam:

```typescript
@Command('ping', 'Check latency')
@Cooldown(5000)  // 5 second cooldown
export class PingCommand extends BaseCommand { }
```

##### @OwnerOnly
Restricts command to bot owner:

```typescript
@Command('shutdown', 'Shut down the bot')
@OwnerOnly()
export class ShutdownCommand extends BaseCommand { }
```

#### Event Decorators

##### @Event
Defines an event handler:

```typescript
import { Event } from '@core/decorators';

@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    // Event handling logic
  }
}
```

##### @Once
Event fires only once:

```typescript
@Event('ready')
@Once()
export class ReadyEvent extends BaseEvent {
  async execute(): Promise<void> {
    console.log('Bot is ready!');
  }
}
```

#### Middleware Decorators

##### @UseMiddleware
Applies middleware to commands:

```typescript
import { Command, UseMiddleware } from '@core/decorators';
import { RateLimitMiddleware } from '@common/middleware';

@Command('api', 'Call external API')
@UseMiddleware(RateLimitMiddleware)
export class ApiCommand extends BaseCommand { }
```

### Module System

Modules group related functionality together, making the codebase organized and maintainable.

#### Module Structure

```typescript
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';

export class GeneralModule extends BaseModule {
  public name = 'GeneralModule';
  public description = 'General purpose commands';

  async initialize(client: ExtendedClient): Promise<void> {
    // Register commands
    await this.registerCommands([
      PingCommand,
      HelpCommand,
      InfoCommand
    ]);

    // Register events
    await this.registerEvents([
      ReadyEvent
    ]);

    // Additional initialization
    this.logger.info('GeneralModule initialized');
  }

  async shutdown(): Promise<void> {
    // Cleanup logic
    this.logger.info('GeneralModule shut down');
  }
}
```

#### Module Lifecycle

1. **Registration**: Modules are registered in `main.ts`
2. **Initialization**: `initialize()` is called on bot startup
3. **Runtime**: Commands and events are active
4. **Shutdown**: `shutdown()` is called on bot termination

#### Module Benefits

- **Encapsulation**: Related code stays together
- **Lazy Loading**: Modules can be loaded on-demand
- **Independent Testing**: Each module can be tested separately
- **Easy Enable/Disable**: Comment out module registration to disable features

## Application Flow

### Startup Sequence

```
1. main.ts
   ├─> Load environment configuration (Config.ts)
   ├─> Initialize DI container (Container.ts)
   ├─> Create ExtendedClient instance
   ├─> Register modules
   │   ├─> GeneralModule.initialize()
   │   ├─> ModerationModule.initialize()
   │   └─> CustomModule.initialize()
   ├─> Connect to database (if DATABASE_URL set)
   ├─> Start health check server
   └─> Login to Discord

2. Discord Connection
   ├─> 'ready' event fires
   ├─> Register slash commands globally
   ├─> Start metrics collection
   └─> Bot is operational

3. Runtime
   ├─> Listen for Discord events
   ├─> Execute event handlers
   ├─> Process slash command interactions
   └─> Apply middleware and guards
```

### Command Execution Flow

```
1. User invokes slash command (/ping)
   ↓
2. Discord sends interaction to bot
   ↓
3. 'interactionCreate' event fires
   ↓
4. ExtendedClient finds matching command
   ↓
5. Middleware runs (if any)
   ├─> Rate limit check
   ├─> Permission check
   └─> Custom middleware
   ↓
6. Guards execute (from decorators)
   ├─> @RequirePermissions check
   ├─> @GuildOnly check
   ├─> @Cooldown check
   └─> @OwnerOnly check
   ↓
7. Command.execute() runs
   ↓
8. Response sent to Discord
   ↓
9. Metrics updated
```

### Event Handling Flow

```
1. Discord event occurs (message created, member joined, etc.)
   ↓
2. Oceanic.js emits event to client
   ↓
3. ExtendedClient finds registered event handlers
   ↓
4. Event.execute() runs for each handler
   ↓
5. Error handling (if any errors occur)
   ↓
6. Metrics updated
```

## Component Architecture

### ExtendedClient

The core of the bot, extending Oceanic's Client class:

```typescript
export class ExtendedClient extends Client {
  public commands: Collection<string, BaseCommand>;
  public events: Collection<string, BaseEvent>;
  public modules: Map<string, BaseModule>;
  public container: DependencyContainer;

  constructor() {
    super({ ... });
    this.setupDI();
    this.loadModules();
  }

  async registerGlobalCommands(): Promise<void> {
    // Register slash commands with Discord
  }

  async handleInteraction(interaction: Interaction): Promise<void> {
    // Process incoming interactions
  }
}
```

### BaseCommand

Abstract class for all commands:

```typescript
export abstract class BaseCommand {
  public name: string;
  public description: string;
  public options: ApplicationCommandOption[];
  public permissions: string[];

  constructor(public client: ExtendedClient) {}

  abstract execute(interaction: CommandInteraction): Promise<void>;

  canExecute(interaction: CommandInteraction): boolean {
    // Check guards and permissions
  }
}
```

### BaseEvent

Abstract class for all events:

```typescript
export abstract class BaseEvent {
  public name: string;
  public once: boolean;

  constructor(public client: ExtendedClient) {}

  abstract execute(...args: any[]): Promise<void>;
}
```

### BaseModule

Abstract class for feature modules:

```typescript
export abstract class BaseModule {
  public abstract name: string;
  public abstract description: string;

  constructor(protected client: ExtendedClient) {}

  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;

  protected async registerCommands(commands: CommandConstructor[]): Promise<void> {
    // Register module commands
  }

  protected async registerEvents(events: EventConstructor[]): Promise<void> {
    // Register module events
  }
}
```

## Design Patterns Used

### 1. Singleton Pattern
- **ExtendedClient**: One instance manages the entire bot
- **DatabaseService**: Single database connection pool
- **Logger**: Shared logging instance

### 2. Factory Pattern
- **EmbedBuilder**: Creates Discord embeds
- **ComponentBuilder**: Creates Discord components (buttons, selects, etc.)

### 3. Observer Pattern
- **Event System**: Events notify subscribers when Discord events occur
- **Middleware**: Middleware observes and intercepts command execution

### 4. Command Pattern
- **BaseCommand**: Encapsulates command logic as objects
- **Decorators**: Metadata attached to commands

### 5. Strategy Pattern
- **Middleware**: Different strategies for request processing
- **Guards**: Different strategies for authorization

## Best Practices

### 1. Use Dependency Injection
```typescript
// Good: Dependencies are injected
constructor(
  @inject(DatabaseService) private db: DatabaseService
) {}

// Bad: Direct instantiation
constructor() {
  this.db = new DatabaseService();
}
```

### 2. Leverage Decorators
```typescript
// Good: Declarative and readable
@Command('ban', 'Ban a user')
@RequirePermissions('BAN_MEMBERS')
@GuildOnly()
export class BanCommand { }

// Bad: Imperative configuration in constructor
export class BanCommand {
  constructor() {
    this.name = 'ban';
    this.permissions = ['BAN_MEMBERS'];
    this.guildOnly = true;
  }
}
```

### 3. Organize into Modules
```typescript
// Good: Grouped by feature
modules/
  ├── moderation/
  │   ├── commands/
  │   ├── events/
  │   └── Moderation.module.ts

// Bad: All commands in one folder
commands/
  ├── Ban.ts
  ├── Kick.ts
  ├── Ping.ts
  ├── Help.ts
```

### 4. Use Type Safety
```typescript
// Good: Typed options
const user = interaction.data.options.getUser('user', true);

// Bad: Any type
const user = interaction.data.options.get('user');
```

---

**Next**: [Creating Commands Guide](./guides/creating-commands.md) →
