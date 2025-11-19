# API Reference

Complete API documentation for the Discord Bot Template v2.0.

## Core Classes

### Base Classes
- **[BaseCommand](./base-command.md)** - Abstract base class for all commands
- **[BaseEvent](./base-event.md)** - Abstract base class for all events
- **[BaseModule](./base-module.md)** - Abstract base class for all modules

### Client
- **[ExtendedClient](./extended-client.md)** - Main bot client extending Oceanic.js Client

## Decorators

- **[Decorators Reference](./decorators.md)** - Complete decorator API
  - @Command
  - @Event
  - @Option
  - @RequirePermissions
  - @GuildOnly / @DMOnly
  - @OwnerOnly
  - @Cooldown
  - @UseMiddleware

## Utilities

### Builders
- **[EmbedBuilder](./builders.md#embedbuilder)** - Discord embed builder
- **[ComponentBuilder](./builders.md#componentbuilder)** - Discord component builder

### Services
- **[Logger](./logger.md)** - Winston-based logging service
- **[Config](./config.md)** - Configuration management with validation
- **[DatabaseService](./database-service.md)** - Prisma database service

### Middleware
- **[Middleware API](./middleware.md)** - Middleware interface and implementations
  - RateLimitMiddleware
  - PermissionMiddleware

## Interfaces

### Core Interfaces
- `ICommand` - Command interface
- `IEvent` - Event interface
- `IModule` - Module interface
- `IMiddleware` - Middleware interface
- `ICommandOptions` - Command configuration options
- `IEventOptions` - Event configuration options

## Quick Reference

### Command Structure

```typescript
import { CommandInteraction } from 'oceanic.js';
import { BaseCommand } from '@core/base';
import { Command, Option, RequirePermissions } from '@core/decorators';
import { ApplicationCommandOptionTypes } from 'oceanic.js';

@Command('commandname', 'Description here')
@Option({
  name: 'option',
  description: 'Option description',
  type: ApplicationCommandOptionTypes.STRING,
  required: true
})
@RequirePermissions('MANAGE_MESSAGES')
export class MyCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    // Command implementation
  }
}
```

### Event Structure

```typescript
import { Message } from 'oceanic.js';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';

@Event('messageCreate')
export class MessageCreateEvent extends BaseEvent {
  async execute(message: Message): Promise<void> {
    // Event handling
  }
}
```

### Module Structure

```typescript
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';

export class MyModule extends BaseModule {
  public name = 'MyModule';
  public description = 'Module description';

  async initialize(client: ExtendedClient): Promise<void> {
    await this.registerCommands([
      MyCommand1,
      MyCommand2
    ]);

    await this.registerEvents([
      MyEvent
    ]);
  }

  async shutdown(): Promise<void> {
    // Cleanup
  }
}
```

## Type Definitions

### CommandInteraction

From Oceanic.js, represents a slash command interaction:

```typescript
interface CommandInteraction extends Interaction {
  data: {
    options: {
      getString(name: string, required?: boolean): string | null;
      getNumber(name: string, required?: boolean): number | null;
      getBoolean(name: string, required?: boolean): boolean | null;
      getUser(name: string, required?: boolean): User | null;
      getChannel(name: string, required?: boolean): Channel | null;
      getRole(name: string, required?: boolean): Role | null;
    }
  };
  createMessage(options: MessageOptions): Promise<Message>;
  defer(flags?: number): Promise<void>;
  editOriginal(options: MessageOptions): Promise<Message>;
}
```

### ApplicationCommandOption

Defines command options:

```typescript
interface ApplicationCommandOption {
  name: string;
  description: string;
  type: ApplicationCommandOptionTypes;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  autocomplete?: boolean;
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
}
```

## Common Patterns

### Sending Messages

```typescript
// Simple message
await interaction.createMessage({
  content: 'Hello!'
});

// With embed
await interaction.createMessage({
  embeds: [
    EmbedBuilder.success('Success!', 'Operation completed')
      .build()
  ]
});

// With components
await interaction.createMessage({
  content: 'Choose an option:',
  components: [
    ComponentBuilder.actionRow([
      ComponentBuilder.button('primary', 'btn_1', 'Click Me')
    ])
  ]
});
```

### Error Handling

```typescript
async execute(interaction: CommandInteraction): Promise<void> {
  try {
    // Command logic
  } catch (error) {
    this.client.logger.error('Command error:', error);

    await interaction.createMessage({
      embeds: [
        EmbedBuilder.error(
          'Error',
          'An error occurred while executing the command'
        ).build()
      ],
      flags: MessageFlags.EPHEMERAL
    });
  }
}
```

### Accessing Services

```typescript
import { inject } from 'tsyringe';
import { DatabaseService } from '@database/DatabaseService';

export class MyCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    @inject(DatabaseService) private db: DatabaseService
  ) {
    super(client);
  }

  async execute(interaction: CommandInteraction): Promise<void> {
    const data = await this.db.user.findUnique({
      where: { id: interaction.user.id }
    });
  }
}
```

---

For detailed documentation on each component, see the individual pages linked above.
