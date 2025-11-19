# Creating Commands Guide

This guide explains how to create new commands in the Discord Bot Template v2.0.

## Basic Command Structure

Commands extend `BaseCommand` and use decorators for configuration:

```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';

@Command('mycommand', 'Description of my command')
@Cooldown(3000) // 3 seconds cooldown
@injectable()
export class MyCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    // Additional configuration
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = true;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    await interaction.createMessage({
      content: 'Hello from my command!',
    });
  }
}
```

## Using Decorators

### @Command
Defines the command name and description:

```typescript
@Command('commandname', 'Command description')
```

### @Cooldown
Sets a cooldown in milliseconds:

```typescript
@Cooldown(5000) // 5 seconds
```

### @RequirePermissions
Requires specific Discord permissions:

```typescript
@RequirePermissions('BAN_MEMBERS', 'KICK_MEMBERS')
```

### @GuildOnly
Restricts command to guild channels only:

```typescript
@GuildOnly()
```

### @OwnerOnly
Restricts command to bot owner:

```typescript
@OwnerOnly()
```

### @NSFW
Marks command as NSFW:

```typescript
@NSFW()
```

## Adding Command Options

Define options in the constructor:

```typescript
constructor(client: ExtendedClient) {
  super(client);
  this.metadata.options = [
    {
      type: 3, // STRING
      name: 'text',
      description: 'Text to echo',
      required: true,
      maxLength: 2000,
    },
    {
      type: 6, // USER
      name: 'user',
      description: 'User to mention',
      required: false,
    },
  ];
}
```

Access options in execute:

```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
  const text = interaction.data.options.getString('text', true);
  const user = interaction.data.options.getUser('user', false);

  await interaction.createMessage({
    content: `${text} ${user ? user.mention : ''}`,
  });
}
```

## Using EmbedBuilder

Create rich embeds easily:

```typescript
import { EmbedBuilder } from '@common/builders';

public async execute(interaction: CommandInteraction): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle('My Embed')
    .setDescription('Embed description')
    .setColor('#5865F2')
    .addField('Field 1', 'Value 1', true)
    .addField('Field 2', 'Value 2', true)
    .setTimestamp()
    .build();

  await interaction.createMessage({ embeds: [embed] });
}
```

Quick embed helpers:

```typescript
// Success embed (green)
const embed = EmbedBuilder.success('Success!', 'Action completed').build();

// Error embed (red)
const embed = EmbedBuilder.error('Error!', 'Something went wrong').build();

// Warning embed (orange)
const embed = EmbedBuilder.warning('Warning!', 'Be careful').build();

// Info embed (blue)
const embed = EmbedBuilder.info('Info', 'Some information').build();
```

## Using ComponentBuilder

Add buttons and select menus:

```typescript
import { ComponentBuilder } from '@common/builders';
import { ButtonStyles } from 'oceanic.js';

public async execute(interaction: CommandInteraction): Promise<void> {
  const components = new ComponentBuilder()
    .addActionRow((row) =>
      row
        .addButton('btn_yes', 'Yes', ButtonStyles.SUCCESS)
        .addButton('btn_no', 'No', ButtonStyles.DANGER)
    )
    .build();

  await interaction.createMessage({
    content: 'Do you agree?',
    components,
  });
}
```

## Dependency Injection

Inject services into your command:

```typescript
import { DatabaseService } from '@database/database.service';

@injectable()
export class MyCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    private database: DatabaseService
  ) {
    super(client);
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const user = await this.database.getOrCreateUser(interaction.user.id);
    // Use user data...
  }
}
```

## Registering Commands

Add your command to a module:

```typescript
// In your-module.module.ts
import { MyCommand } from './commands/MyCommand';

public async initialize(client: ExtendedClient): Promise<void> {
  const commands = [
    Container.get(MyCommand),
    // ... other commands
  ];

  commands.forEach((command) => client.registerCommand(command));
}
```

## Error Handling

Always handle errors in commands:

```typescript
public async execute(interaction: CommandInteraction): Promise<void> {
  try {
    // Command logic
    await someAsyncOperation();

    await interaction.createMessage({
      content: 'Success!',
    });
  } catch (error) {
    this.client.logger.error('Command error:', error);

    await interaction.createMessage({
      content: '❌ An error occurred while executing this command.',
      flags: 64, // Ephemeral
    });
  }
}
```

## Best Practices

1. **Always use decorators** - They handle metadata and validation
2. **Use EmbedBuilder** - Provides a fluent, type-safe API
3. **Handle errors gracefully** - Don't let errors crash the bot
4. **Use dependency injection** - Makes code testable and maintainable
5. **Set appropriate cooldowns** - Prevent spam
6. **Validate permissions** - Use @RequirePermissions when needed
7. **Use flags: 64 for errors** - Makes error messages ephemeral (only visible to user)
8. **Log important actions** - Use this.client.logger

## Complete Example

Here's a complete example of a well-structured command:

```typescript
import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, RequirePermissions, GuildOnly, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';
import { DatabaseService } from '@database/database.service';

@Command('userinfo', 'Get information about a user')
@GuildOnly()
@Cooldown(5000)
@injectable()
export class UserInfoCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    private database: DatabaseService
  ) {
    super(client);
    this.metadata.options = [
      {
        type: 6, // USER
        name: 'user',
        description: 'The user to get info about',
        required: false,
      },
    ];
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const targetUser = interaction.data.options.getUser('user') || interaction.user;
      const member = interaction.guild?.members.get(targetUser.id);

      if (!member) {
        await interaction.createMessage({
          content: '❌ User not found in this server.',
          flags: 64,
        });
        return;
      }

      const dbUser = await this.database.getOrCreateUser(targetUser.id);
      const joinedAt = member.joinedAt?.toISOString().split('T')[0] || 'Unknown';
      const createdAt = targetUser.createdAt.toISOString().split('T')[0];

      const embed = new EmbedBuilder()
        .setTitle(`User Information: ${targetUser.username}`)
        .setThumbnail(targetUser.avatarURL())
        .addField('User ID', targetUser.id, true)
        .addField('Joined Server', joinedAt, true)
        .addField('Account Created', createdAt, true)
        .addField('Bot Account', targetUser.bot ? 'Yes' : 'No', true)
        .addField('Level', dbUser.level.toString(), true)
        .setColor('#5865F2')
        .setTimestamp()
        .build();

      await interaction.createMessage({ embeds: [embed] });
    } catch (error) {
      this.client.logger.error('UserInfo command error:', error);

      await interaction.createMessage({
        content: '❌ Failed to fetch user information.',
        flags: 64,
      });
    }
  }
}
```
