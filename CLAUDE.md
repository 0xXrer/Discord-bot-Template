# CLAUDE.md - AI Assistant Guide for Discord Bot Template v2.0

## Project Overview

This is a **modern Discord Bot Template** built with **Oceanic.js** and **TypeScript**, featuring a **decorator-based architecture**, **dependency injection**, and **modular design**. Version 2.0 represents a complete architectural overhaul from v1.x, introducing professional patterns used in enterprise applications.

**Core Capabilities:**
- Decorator-based command and event system
- Dependency injection with tsyringe
- Module-based architecture for feature organization
- User-installable applications support
- Comprehensive middleware system
- Database integration with Prisma ORM
- Health monitoring with Prometheus metrics
- Production-ready with Docker support

**Key Technologies:**
- **Oceanic.js** v1.10.2 - Discord API library
- **TypeScript** v5.3.3 - Type-safe JavaScript with strict mode
- **tsyringe** v4.8.0 - Dependency injection container
- **Prisma** v5.8.0 - Modern ORM for database operations
- **Winston** v3.11.0 - Enterprise logging library
- **Jest** v29.7.0 - Testing framework
- **Node.js** 18+ - Runtime environment

**Project License:** MIT (Copyright 2025 0xXrer)

---

## Repository Structure

```
Discord-bot-Template/
├── src/
│   ├── core/                          # Core framework
│   │   ├── decorators/                # Decorator definitions
│   │   │   ├── Command.decorator.ts   # @Command decorator
│   │   │   ├── Event.decorator.ts     # @Event decorator
│   │   │   ├── Guards.decorator.ts    # @GuildOnly, @OwnerOnly, etc.
│   │   │   ├── Cooldown.decorator.ts  # @Cooldown decorator
│   │   │   ├── Middleware.decorator.ts # @Middleware decorator
│   │   │   └── Options.decorator.ts   # Command options decorators
│   │   ├── container/                 # Dependency injection
│   │   │   └── Container.ts           # DI container wrapper
│   │   ├── client/                    # Extended Discord client
│   │   │   └── ExtendedClient.ts      # Main bot client class
│   │   ├── base/                      # Abstract base classes
│   │   │   ├── BaseCommand.ts         # Base for all commands
│   │   │   ├── BaseEvent.ts           # Base for all events
│   │   │   └── BaseModule.ts          # Base for feature modules
│   │   └── interfaces/                # TypeScript interfaces
│   │       ├── ICommand.ts            # Command interface
│   │       ├── IEvent.ts              # Event interface
│   │       ├── IModule.ts             # Module interface
│   │       └── IMiddleware.ts         # Middleware interface
│   ├── modules/                       # Feature modules
│   │   ├── general/                   # General functionality
│   │   │   ├── commands/              # General commands
│   │   │   │   ├── PingCommand.ts     # Ping command
│   │   │   │   ├── HelpCommand.ts     # Help command
│   │   │   │   └── InfoCommand.ts     # Info command
│   │   │   ├── events/                # General events
│   │   │   │   ├── ReadyEvent.ts      # Bot ready handler
│   │   │   │   ├── InteractionCreateEvent.ts  # Interaction handler
│   │   │   │   └── ErrorEvent.ts      # Error handler
│   │   │   └── general.module.ts      # General module registration
│   │   └── moderation/                # Moderation functionality
│   │       ├── commands/              # Moderation commands
│   │       │   ├── BanCommand.ts      # Ban command
│   │       │   ├── KickCommand.ts     # Kick command
│   │       │   └── WarnCommand.ts     # Warn command
│   │       └── moderation.module.ts   # Moderation module registration
│   ├── common/                        # Shared utilities
│   │   ├── builders/                  # Builder patterns
│   │   │   ├── EmbedBuilder.ts        # Fluent embed builder
│   │   │   └── ComponentBuilder.ts    # Component builder
│   │   ├── middleware/                # Middleware implementations
│   │   │   ├── PermissionMiddleware.ts    # Permission checking
│   │   │   ├── LoggingMiddleware.ts       # Request logging
│   │   │   └── RateLimitMiddleware.ts     # Rate limiting
│   │   ├── logger/                    # Logging system
│   │   │   └── Logger.ts              # Winston logger wrapper
│   │   └── utils/                     # Utility classes
│   │       └── Collection.ts          # Extended Map with utilities
│   ├── database/                      # Database layer
│   │   ├── database.service.ts        # Prisma database service
│   │   └── index.ts                   # Database exports
│   ├── config/                        # Configuration
│   │   └── Config.ts                  # Environment config with validation
│   ├── health/                        # Monitoring
│   │   └── HealthCheckServer.ts       # Health checks & metrics
│   └── main.ts                        # Application entry point
├── prisma/                            # Database schema
│   └── schema.prisma                  # Prisma schema definition
├── docs/                              # Documentation
│   ├── getting-started.md             # Quick start guide
│   ├── api/                           # API documentation
│   └── guides/                        # Development guides
├── .github/workflows/                 # CI/CD pipelines
│   └── ci.yml                         # GitHub Actions workflow
├── dist/                              # Compiled JavaScript (generated)
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── jest.config.js                     # Jest testing configuration
├── docker-compose.yml                 # Docker orchestration
├── Dockerfile                         # Docker image definition
├── .env.example                       # Environment template
└── LICENSE                            # MIT License
```

---

## Architecture Patterns

### 1. **Decorator-Based System**

Version 2.0 uses TypeScript decorators extensively to define metadata and behavior. This requires `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`.

**IMPORTANT:** All files using decorators must import `reflect-metadata` at the top:
```typescript
import 'reflect-metadata';
```

#### Command Decorators

Commands use the `@Command` decorator to define metadata:

```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown, GuildOnly, RequirePermissions } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('example', 'An example command description')
@RequirePermissions('MANAGE_MESSAGES', 'SEND_MESSAGES')
@GuildOnly()
@Cooldown(5000)  // 5 seconds
@injectable()
export class ExampleCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    // Optional: Override metadata
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = false;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const embed = EmbedBuilder.success('Success!', 'Command executed successfully')
      .setTimestamp()
      .build();

    await interaction.createMessage({ embeds: [embed] });
  }
}
```

**Available Guard Decorators:**
- `@GuildOnly()` - Command only works in guilds
- `@DMOnly()` - Command only works in DMs
- `@OwnerOnly()` - Command restricted to bot owner
- `@NSFW()` - Command restricted to NSFW channels
- `@RequirePermissions(...permissions)` - Requires specific Discord permissions
- `@Cooldown(milliseconds)` - Adds cooldown period between uses

#### Event Decorators

Events use the `@Event` decorator:

```typescript
import { injectable } from 'tsyringe';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { Message } from 'oceanic.js';

@Event('messageCreate', false)  // name, once
@injectable()
export class MessageCreateEvent extends BaseEvent {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    this.client.logger.debug(`Message from ${message.author.username}: ${message.content}`);
  }
}
```

**Event Options:**
- First parameter: Event name (must match Oceanic.js event names)
- Second parameter: `once` boolean (default: false)

### 2. **Dependency Injection Container**

The bot uses **tsyringe** for dependency injection, managed through the `Container` wrapper class.

**Key DI Decorators:**
- `@injectable()` - Marks a class as injectable
- `@singleton()` - Marks a class as singleton (single instance)

**Container Methods:**
- `Container.get<T>(token)` - Resolve a dependency
- `Container.register(token, value)` - Register instance
- `Container.registerSingleton(token, target?)` - Register singleton
- `Container.isRegistered(token)` - Check registration

**Example Usage:**
```typescript
import { container } from 'tsyringe';
import { Logger } from '@common/logger';

// In main.ts bootstrap
const logger = container.resolve(Logger);

// In a class constructor (automatic injection)
@injectable()
export class MyService {
  constructor(
    private logger: Logger,
    private config: Config
  ) {
    // Dependencies automatically injected
  }
}
```

### 3. **Module-Based Architecture**

Features are organized into **modules** that encapsulate related commands and events.

**Module Structure:**
```typescript
import { injectable } from 'tsyringe';
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';
import { Container } from '@core/container';

import { MyCommand } from './commands/MyCommand';
import { MyEvent } from './events/MyEvent';

@injectable()
export class MyModule extends BaseModule {
  public name = 'MyModule';

  constructor(client: ExtendedClient) {
    super(client);
  }

  public async initialize(client: ExtendedClient): Promise<void> {
    client.logger.info(`Initializing ${this.name} module...`);

    // Resolve commands and events from DI container
    const commands = [
      Container.get<MyCommand>(MyCommand),
    ];

    const events = [
      Container.get<MyEvent>(MyEvent),
    ];

    // Register with client
    commands.forEach((command) => client.registerCommand(command));
    events.forEach((event) => client.registerEvent(event));

    client.logger.info(`${this.name} module initialized with ${commands.length} commands and ${events.length} events`);
  }

  public async shutdown?(): Promise<void> {
    // Optional cleanup logic
    this.client.logger.info(`${this.name} module shutting down...`);
  }
}
```

**Module Registration in main.ts:**
```typescript
const generalModule = container.resolve(GeneralModule);
await generalModule.initialize(client);
client.registerModule(generalModule);

const moderationModule = container.resolve(ModerationModule);
await moderationModule.initialize(client);
client.registerModule(moderationModule);
```

### 4. **Path Aliases**

The project uses TypeScript path aliases for cleaner imports:

```typescript
// Instead of: import { BaseCommand } from '../../../core/base/BaseCommand';
import { BaseCommand } from '@core/base';

// Available aliases (defined in tsconfig.json):
import { ExtendedClient } from '@core/client';
import { PingCommand } from '@modules/general/commands/PingCommand';
import { EmbedBuilder } from '@common/builders';
import { DatabaseService } from '@database/database.service';
import { Config } from '@config/Config';
```

**Path Alias Mapping:**
- `@core/*` → `src/core/*`
- `@modules/*` → `src/modules/*`
- `@common/*` → `src/common/*`
- `@database/*` → `src/database/*`
- `@config/*` → `src/config/*`

### 5. **Builder Pattern**

The bot includes fluent builder classes for common Discord structures.

#### EmbedBuilder

```typescript
import { EmbedBuilder } from '@common/builders';

// Fluent API
const embed = new EmbedBuilder()
  .setTitle('Example Title')
  .setDescription('Example description')
  .setColor(0x00ff00)
  .addField('Field 1', 'Value 1', true)
  .addField('Field 2', 'Value 2', true)
  .setTimestamp()
  .setFooter('Footer text', 'https://example.com/icon.png')
  .build();

// Helper methods with pre-configured styles
const successEmbed = EmbedBuilder.success('Success', 'Operation completed').build();
const errorEmbed = EmbedBuilder.error('Error', 'Something went wrong').build();
const warningEmbed = EmbedBuilder.warning('Warning', 'Proceed with caution').build();
const infoEmbed = EmbedBuilder.info('Info', 'Informational message').build();
```

### 6. **Middleware System**

Middleware intercepts command execution for cross-cutting concerns.

**Built-in Middleware:**
- **PermissionMiddleware** - Validates Discord permissions
- **LoggingMiddleware** - Logs command usage
- **RateLimitMiddleware** - Enforces rate limits

**Creating Custom Middleware:**
```typescript
import { singleton } from 'tsyringe';
import { IMiddleware, MiddlewareContext, NextFunction } from '@core/interfaces/IMiddleware';
import { Middleware } from '@core/decorators';

@Middleware()
@singleton()
export class MyMiddleware implements IMiddleware {
  public async use(context: MiddlewareContext, next: NextFunction): Promise<void> {
    const { interaction, command } = context;

    // Pre-execution logic
    console.log(`Executing ${command.metadata.name}`);

    // Call next middleware or command
    await next();

    // Post-execution logic
    console.log(`Finished ${command.metadata.name}`);
  }
}
```

### 7. **Configuration Management**

**Config** class (`src/config/Config.ts`) validates and provides typed access to environment variables:

**Required Variables:**
- `BOT_TOKEN` - Discord bot token
- `CLIENT_ID` - Discord application ID
- `CLIENT_SECRET` - OAuth2 secret

**Optional Variables:**
- `OWNER_ID` - Bot owner Discord user ID
- `NODE_ENV` - Environment (development/production, default: development)
- `LOG_LEVEL` - Logging level (debug/info/warn/error, default: info)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SHARDS` - Number of shards (default: 1)
- `PORT` - Health check server port (default: 3000)
- `RATE_LIMIT_MAX` - Max requests per window (default: 5)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in ms (default: 60000)

**Usage:**
```typescript
import { Config } from '@config/Config';

const config = container.resolve(Config);
const token = config.get('token');
const ownerId = config.get('ownerId');
```

### 8. **Database Integration**

The bot uses **Prisma ORM** for database operations.

**DatabaseService** (`src/database/database.service.ts`):
```typescript
import { DatabaseService } from '@database/database.service';

const db = container.resolve(DatabaseService);
await db.connect();

// Access Prisma client
const users = await db.client.user.findMany();
```

**Prisma Workflow:**
1. Define schema in `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migrations
3. Run `npm run prisma:generate` to generate Prisma client
4. Use `DatabaseService` to access database

### 9. **Health Monitoring**

**HealthCheckServer** (`src/health/HealthCheckServer.ts`) provides monitoring endpoints:

- `GET /health` - Basic health check
- `GET /ready` - Readiness check
- `GET /metrics` - Prometheus metrics
- `GET /stats` - JSON statistics

**Metrics Included:**
- Command execution count
- Event handler count
- Active connections
- Memory usage
- Uptime

---

## Development Workflows

### Initial Setup

1. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd Discord-bot-Template
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Optional: Setup Database:**
   ```bash
   docker-compose up -d postgres
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Run the Bot:**
   ```bash
   # Development (hot reload)
   npm run dev

   # Production
   npm run build
   npm start
   ```

### Adding New Commands

1. **Create Command File:** `src/modules/[module]/commands/MyCommand.ts`

2. **Implement Command:**
   ```typescript
   import 'reflect-metadata';
   import { CommandInteraction } from 'oceanic.js';
   import { injectable } from 'tsyringe';
   import { BaseCommand } from '@core/base';
   import { Command, Cooldown } from '@core/decorators';
   import { ExtendedClient } from '@core/client';

   @Command('mycommand', 'Description of my command')
   @Cooldown(3000)
   @injectable()
   export class MyCommand extends BaseCommand {
     constructor(client: ExtendedClient) {
       super(client);
       this.metadata.userInstallable = true;
     }

     public async execute(interaction: CommandInteraction): Promise<void> {
       await interaction.createMessage({
         content: 'Hello from my command!'
       });
     }
   }
   ```

3. **Register in Module:** Edit `src/modules/[module]/[module].module.ts`
   ```typescript
   import { MyCommand } from './commands/MyCommand';

   public async initialize(client: ExtendedClient): Promise<void> {
     const commands = [
       Container.get<MyCommand>(MyCommand),
       // ... other commands
     ];

     commands.forEach((command) => client.registerCommand(command));
   }
   ```

4. **Restart Bot** - Commands register on ready event

### Adding New Events

1. **Create Event File:** `src/modules/[module]/events/MyEvent.ts`

2. **Implement Event:**
   ```typescript
   import 'reflect-metadata';
   import { injectable } from 'tsyringe';
   import { BaseEvent } from '@core/base';
   import { Event } from '@core/decorators';
   import { ExtendedClient } from '@core/client';
   import { Guild } from 'oceanic.js';

   @Event('guildCreate', false)
   @injectable()
   export class MyEvent extends BaseEvent {
     constructor(client: ExtendedClient) {
       super(client);
     }

     public async execute(guild: Guild): Promise<void> {
       this.client.logger.info(`Joined guild: ${guild.name}`);
     }
   }
   ```

3. **Register in Module:**
   ```typescript
   import { MyEvent } from './events/MyEvent';

   public async initialize(client: ExtendedClient): Promise<void> {
     const events = [
       Container.get<MyEvent>(MyEvent),
       // ... other events
     ];

     events.forEach((event) => client.registerEvent(event));
   }
   ```

### Creating New Modules

1. **Create Module Directory:** `src/modules/mymodule/`

2. **Create Module File:** `src/modules/mymodule/mymodule.module.ts`
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

       // Register commands and events here

       client.logger.info(`${this.name} module initialized`);
     }
   }
   ```

3. **Register in main.ts:**
   ```typescript
   import { MyModule } from '@modules/mymodule/mymodule.module';

   const myModule = container.resolve(MyModule);
   await myModule.initialize(client);
   client.registerModule(myModule);
   ```

### Testing

**Run Tests:**
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

**Example Test:**
```typescript
import { EmbedBuilder } from '@common/builders';

describe('EmbedBuilder', () => {
  it('should build success embed', () => {
    const embed = EmbedBuilder.success('Test', 'Description');
    expect(embed.toJSON().title).toBe('✅ Test');
    expect(embed.toJSON().color).toBe(0x00ff00);
  });
});
```

### Docker Deployment

**Development with Docker Compose:**
```bash
docker-compose up -d      # Start all services
docker-compose logs -f bot # View bot logs
docker-compose down       # Stop services
```

**Services in docker-compose.yml:**
- `bot` - Discord bot application
- `postgres` - PostgreSQL database
- `redis` - Redis cache
- `prometheus` - Metrics collection
- `grafana` - Metrics visualization

---

## Key Conventions & Patterns

### File Naming
- **Commands:** PascalCase with "Command" suffix, e.g., `PingCommand.ts`
- **Events:** PascalCase with "Event" suffix, e.g., `ReadyEvent.ts`
- **Modules:** lowercase with ".module.ts" extension, e.g., `general.module.ts`
- **Builders:** PascalCase with "Builder" suffix, e.g., `EmbedBuilder.ts`

### Import Order
Organize imports in this order:
1. reflect-metadata (if using decorators)
2. Node built-ins
3. External packages (oceanic.js, tsyringe)
4. Path aliases (@core, @modules, @common, etc.)
5. Relative imports

```typescript
import 'reflect-metadata';
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command } from '@core/decorators';
import { ExtendedClient } from '@core/client';
```

### Logging

Use the **Winston logger** via client:

```typescript
this.client.logger.debug('Debug message');
this.client.logger.info('Info message');
this.client.logger.warn('Warning message');
this.client.logger.error('Error message', errorObject);
```

**Log Levels:** debug < info < warn < error

### Error Handling

- Commands should handle errors internally with try/catch
- Global error handler in `ErrorEvent.ts`
- Unhandled rejections and exceptions caught in `main.ts`

```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
  try {
    // Command logic
  } catch (error) {
    this.client.logger.error('Command error:', error);
    await interaction.createMessage({
      content: 'An error occurred while executing this command.',
      flags: 64 // Ephemeral
    });
  }
}
```

### TypeScript Strict Mode

The project uses TypeScript strict mode. Follow these guidelines:
- Initialize all properties or mark as optional with `?`
- Use `!` non-null assertion only when absolutely certain
- Prefer type guards over type assertions
- Use `unknown` instead of `any` when type is truly unknown

### Code Style
- **Indentation:** 2 spaces (enforced by Prettier)
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Trailing commas:** Multi-line only
- **Access modifiers:** Use `public`, `private`, `protected` explicitly
- **Async/await:** Preferred over raw promises

---

## Important Implementation Details

### Command Interaction Flow

1. User invokes slash command in Discord
2. `InteractionCreateEvent` fires
3. Event retrieves command from `client.commands` collection
4. `command.canExecute()` validates:
   - Owner-only restriction
   - Guild-only restriction
   - DM-only restriction
   - Cooldown status
5. `command.execute()` runs command logic

### Command Registration

Commands are registered **globally** in the `ReadyEvent`:

```typescript
await this.client.registerGlobalCommands();
```

**Process:**
1. Collects all registered commands from `client.commands`
2. Builds command data array with metadata
3. Calls `client.application.bulkEditGlobalCommands()`
4. Discord propagates changes (can take 1-2 minutes)

### User-Installable Apps

Commands support user installation via metadata:

```typescript
this.metadata.integrationTypes = [0, 1];  // 0=guild, 1=user
this.metadata.contexts = [0, 1, 2];       // 0=guild, 1=DM, 2=group DM
this.metadata.userInstallable = true;
```

### Graceful Shutdown

Shutdown sequence (triggered by SIGINT/SIGTERM):

1. Signal handler in `main.ts` calls `shutdown()`
2. Calls `client.shutdown()`
3. Each module's `shutdown()` method called
4. Database disconnected
5. Health check server stopped
6. Process exits with code 0

---

## Code Modification Guidelines

### When Adding Features

1. **Use decorators** - Don't manually define metadata
2. **Inject dependencies** - Use constructor injection
3. **Follow module structure** - Keep related commands/events together
4. **Use path aliases** - Import from `@core`, `@modules`, etc.
5. **Import reflect-metadata** - Required for decorator metadata
6. **Use builders** - EmbedBuilder for embeds, ComponentBuilder for components
7. **Log appropriately** - Use Winston logger, not console.log
8. **Handle errors** - Try/catch in async methods
9. **Write tests** - Add Jest tests for new functionality

### When Refactoring

1. **Preserve decorator contracts** - Don't change decorator signatures
2. **Maintain DI compatibility** - Keep classes injectable
3. **Update module registrations** - If moving commands/events
4. **Test thoroughly** - Run test suite after changes
5. **Update types** - Keep TypeScript definitions accurate

### Best Practices

1. **One command per file** - Don't combine multiple commands
2. **One event per file** - Don't combine multiple events
3. **Use TypeScript features** - Leverage types, interfaces, enums
4. **Validate user input** - Check interaction options before use
5. **Respond to interactions** - Always respond within 3 seconds
6. **Use ephemeral messages** - For error messages (flags: 64)
7. **Clean up resources** - Implement shutdown() in modules if needed
8. **Document complex logic** - Add JSDoc comments for clarity

---

## Common Pitfalls & Solutions

### Issue: "Cannot find module '@core/...'"
**Cause:** Path aliases not resolved

**Solution:**
- Ensure `tsconfig-paths/register` in dev script
- For production, ensure compiled correctly
- Check `baseUrl` and `paths` in `tsconfig.json`

### Issue: Decorator Metadata Not Working
**Cause:** Missing `reflect-metadata` import

**Solution:** Add `import 'reflect-metadata';` at the top of file

### Issue: Dependency Injection Fails
**Causes:**
- Class not marked with `@injectable()` or `@singleton()`
- Trying to resolve unregistered dependency
- Circular dependency

**Solution:**
- Add `@injectable()` decorator to class
- Check DI container registration
- Refactor to avoid circular dependencies

### Issue: Command Not Registering
**Causes:**
- Command not added to module's initialize method
- Missing `@Command` decorator
- Not using `Container.get()` to resolve

**Solution:** Verify module registration and decorator usage

### Issue: Guards Not Working
**Causes:**
- Decorator order matters (metadata applied bottom-up)
- Guard metadata not properly read

**Solution:** Ensure guards applied before class, check `BaseCommand` reads metadata

### Issue: Database Connection Fails
**Causes:**
- `DATABASE_URL` not set in .env
- Database not running
- Prisma client not generated

**Solution:**
- Verify .env configuration
- Start database: `docker-compose up -d postgres`
- Generate client: `npm run prisma:generate`

### Issue: TypeScript Compilation Errors
**Common errors:**
- Missing types - Install `@types/*` package
- Strict null checks - Initialize or mark optional
- Decorator errors - Check `experimentalDecorators` enabled

**Solution:** Run `npm run build` for detailed errors

---

## Testing Strategies

### Unit Testing

Test individual commands, events, and utilities:

```typescript
import { PingCommand } from '@modules/general/commands/PingCommand';
import { ExtendedClient } from '@core/client';

describe('PingCommand', () => {
  let command: PingCommand;
  let mockClient: ExtendedClient;

  beforeEach(() => {
    mockClient = createMockClient();
    command = new PingCommand(mockClient);
  });

  it('should respond with latency', async () => {
    const mockInteraction = createMockInteraction();
    await command.execute(mockInteraction);
    expect(mockInteraction.createMessage).toHaveBeenCalled();
  });
});
```

### Integration Testing

Test module initialization and command flow:

```typescript
describe('GeneralModule', () => {
  it('should register all commands and events', async () => {
    const client = createTestClient();
    const module = new GeneralModule(client);

    await module.initialize(client);

    expect(client.commands.size).toBeGreaterThan(0);
    expect(client.events.size).toBeGreaterThan(0);
  });
});
```

### Manual Testing

1. **Use test Discord server** - Don't test in production
2. **Test different contexts:**
   - Guild channels
   - DMs
   - User-installed contexts
3. **Test permission scenarios** - Different user roles
4. **Test error cases** - Invalid inputs, missing permissions
5. **Monitor logs** - Check Winston output for issues

---

## Environment-Specific Behavior

### Development Mode (`NODE_ENV=development`)
- Uses `ts-node-dev` for hot reload
- Loads `.ts` files directly
- More verbose logging (set `LOG_LEVEL=debug`)
- Source maps enabled
- Faster iteration (no manual compilation)

### Production Mode (`NODE_ENV=production`)
- Loads compiled `.js` files from `dist/`
- Optimized performance
- Requires `npm run build` before deployment
- Production logging level (info/warn/error)
- Source maps for debugging

---

## Integration Points for AI Assistants

### When Asked to Add Commands

1. **Gather requirements:**
   - Command name and description
   - Required options/parameters
   - Required permissions
   - Guild-only or DM-only?
   - Cooldown period
   - User-installable?

2. **Create command file** in appropriate module
3. **Apply decorators** - @Command, guards, @Cooldown
4. **Implement execute()** method
5. **Register in module** initialize() method
6. **Test with `npm run dev`**

### When Asked to Add Events

1. **Identify event name** - Must match Oceanic.js events
2. **Create event file** in appropriate module
3. **Apply @Event decorator** with correct name and once flag
4. **Implement execute()** method with correct parameters
5. **Register in module** initialize() method
6. **Test thoroughly** - Events can fire frequently

### When Asked to Create Modules

1. **Create module directory** structure
2. **Create module class** extending BaseModule
3. **Implement initialize()** method
4. **Optional: Implement shutdown()** for cleanup
5. **Register in main.ts** bootstrap function
6. **Add commands and events** to module

### When Asked About Configuration

1. **Check .env.example** for available variables
2. **Verify Config.ts** for validation rules
3. **Document new variables** in both files
4. **Update validation schema** if adding new required fields

### When Asked to Modify Core Systems

1. **Review impact** - Core changes affect all commands/events
2. **Update interfaces** if contracts change
3. **Update base classes** carefully
4. **Test existing functionality** for breakage
5. **Consider backward compatibility**
6. **Update documentation** if behavior changes

---

## Quick Reference

### File Locations
- **Entry point:** `src/main.ts`
- **Client:** `src/core/client/ExtendedClient.ts`
- **Base classes:** `src/core/base/`
- **Decorators:** `src/core/decorators/`
- **DI Container:** `src/core/container/Container.ts`
- **Config:** `src/config/Config.ts`
- **Logger:** `src/common/logger/Logger.ts`
- **Database:** `src/database/database.service.ts`

### Key Methods
- `client.initialize()` - Loads modules and connects
- `client.registerCommand(command)` - Registers a command
- `client.registerEvent(event)` - Registers an event
- `client.registerModule(module)` - Registers a module
- `client.registerGlobalCommands()` - Registers commands with Discord
- `client.shutdown()` - Graceful disconnect
- `Container.get<T>(token)` - Resolve dependency
- `module.initialize(client)` - Initialize module

### Available npm Scripts
- `npm run dev` - Development with hot reload (ts-node-dev)
- `npm run build` - Compile TypeScript
- `npm start` - Run production build
- `npm test` - Run Jest tests
- `npm run test:watch` - Jest watch mode
- `npm run test:coverage` - Generate coverage
- `npm run lint` - ESLint check
- `npm run lint:fix` - ESLint auto-fix
- `npm run format` - Prettier format
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Docker containers

### Decorator Quick Reference
```typescript
// Commands
@Command(name, description)
@Cooldown(milliseconds)
@GuildOnly()
@DMOnly()
@OwnerOnly()
@NSFW()
@RequirePermissions(...permissions)
@injectable()

// Events
@Event(name, once)
@injectable()

// DI
@singleton()
@injectable()
```

### EmbedBuilder Quick Reference
```typescript
// Methods
new EmbedBuilder()
  .setTitle(title)
  .setDescription(description)
  .setColor(color)
  .setURL(url)
  .setTimestamp()
  .setThumbnail(url)
  .setImage(url)
  .setAuthor(name, iconURL?, url?)
  .setFooter(text, iconURL?)
  .addField(name, value, inline?)
  .addFields(...fields)
  .build()

// Helpers
EmbedBuilder.success(title, description)
EmbedBuilder.error(title, description)
EmbedBuilder.warning(title, description)
EmbedBuilder.info(title, description)
```

---

## Additional Resources

- **Oceanic.js Documentation:** https://docs.oceanic.ws/
- **Discord Developer Portal:** https://discord.com/developers/applications
- **TypeScript Decorators:** https://www.typescriptlang.org/docs/handbook/decorators.html
- **tsyringe Documentation:** https://github.com/microsoft/tsyringe
- **Prisma Documentation:** https://www.prisma.io/docs/
- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Project Documentation:** `/docs/getting-started.md`

---

## Notes for AI Assistants

1. **This is v2.0** - Completely different from v1.x (handler-based)
2. **Decorators are essential** - All commands/events use decorators
3. **DI container is central** - Use Container.get() to resolve dependencies
4. **Path aliases are standard** - Always use @core, @modules, etc.
5. **reflect-metadata is required** - Import at top of decorator files
6. **Module-based, not auto-loading** - Commands/events registered explicitly
7. **No console.log** - Use Winston logger via this.client.logger
8. **TypeScript strict mode** - Type safety is enforced
9. **Test before committing** - Run `npm test` and `npm run dev`
10. **Follow existing patterns** - Study `PingCommand.ts` and `ReadyEvent.ts`

**When in doubt:**
- Check existing implementations in `src/modules/general/`
- Review decorator definitions in `src/core/decorators/`
- Consult interfaces in `src/core/interfaces/`
- Run tests with `npm test`

**Key Differences from v1.x:**
- ❌ No handler-based auto-loading
- ❌ No manual metadata objects in constructor
- ❌ No FileUtils for loading commands
- ✅ Decorator-based metadata
- ✅ DI container for dependency management
- ✅ Module-based organization
- ✅ Path aliases for imports
- ✅ Winston logger instead of custom Logger
- ✅ Prisma ORM for database
- ✅ Jest for testing
- ✅ Docker support with docker-compose
