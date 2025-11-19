# Frequently Asked Questions (FAQ)

Common questions about the Discord Bot Template.

## General Questions

### What is this template?

A modern Discord bot template built with TypeScript, Oceanic.js, decorators, and dependency injection. It provides a solid foundation for building production-ready Discord bots with best practices built in.

### What's the difference between v1 and v2?

**v2.0 (current):**
- Decorator-based architecture (`@Command`, `@Event`, etc.)
- Dependency injection with tsyringe
- Modular organization
- Built-in monitoring and health checks
- Comprehensive documentation

**v1.0 (legacy):**
- Class-based without decorators
- Manual dependency management
- Command handler pattern
- Basic structure

### Do I need to know TypeScript?

Basic TypeScript knowledge is recommended. The template uses TypeScript features like:
- Decorators
- Interfaces
- Generics
- Type inference

If you're new to TypeScript, check the [TypeScript Handbook](https://www.typescriptlang.org/docs/).

### Can I use this for commercial projects?

Yes! This template is MIT licensed, which means you can:
- Use it commercially
- Modify it freely
- Distribute it
- Use it privately

Just retain the original license notice.

## Setup Questions

### Why isn't my bot responding?

Common causes:
1. **Commands not registered** - Wait 1-2 minutes after bot starts
2. **Missing scopes** - Bot needs `bot` and `applications.commands` scopes
3. **Missing intents** - Enable required intents in Developer Portal
4. **Bot offline** - Check if process is running

See [Troubleshooting Guide](./troubleshooting.md#bot-shows-as-online-but-doesnt-respond).

### Do I need a database?

No, it's optional. The database is only needed for features that store data (like warnings, economy, leveling). Basic commands work without a database.

To use without database:
1. Remove database-dependent modules
2. Don't set `DATABASE_URL` in `.env`
3. Remove Prisma dependencies (optional)

### What Node.js version do I need?

**Node.js 18 or higher** is required. The template uses modern JavaScript features that need Node 18+.

Check your version:
```bash
node --version
```

Upgrade if needed:
```bash
# Using nvm
nvm install 20
nvm use 20
```

### Can I use JavaScript instead of TypeScript?

Not recommended. The template heavily uses TypeScript features (decorators, types, interfaces). Converting to JavaScript would require significant refactoring and you'd lose type safety.

If you prefer JavaScript, consider using a different template or learning TypeScript basics.

## Development Questions

### How do I add a new command?

1. Create command file in `src/modules/yourmodule/commands/`
2. Extend `BaseCommand` and add decorators
3. Register in your module's `initialize()` method
4. Restart bot

See [Creating Commands Guide](./guides/creating-commands.md).

### How do I add command options?

Use the `@Option` decorator:

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

### How do I restrict commands to certain users?

Use guard decorators:

```typescript
// Owner only
@OwnerOnly()

// Requires permission
@RequirePermissions('BAN_MEMBERS')

// Guild only
@GuildOnly()

// DM only
@DMOnly()
```

### How do I make a command take time to respond?

Use `defer()`:

```typescript
async execute(interaction: CommandInteraction): Promise<void> {
  await interaction.defer(); // Shows "Bot is thinking..."

  const result = await this.longOperation();

  await interaction.editOriginal({ content: result });
}
```

### Can I have subcommands?

Yes, though not built into the template by default. You can:

1. **Use option-based routing:**
```typescript
@Command('admin', 'Admin commands')
@Option({
  name: 'action',
  type: ApplicationCommandOptionTypes.STRING,
  choices: [
    { name: 'ban', value: 'ban' },
    { name: 'kick', value: 'kick' }
  ]
})
export class AdminCommand extends BaseCommand {
  async execute(interaction: CommandInteraction): Promise<void> {
    const action = interaction.data.options.getString('action', true);

    switch (action) {
      case 'ban': await this.handleBan(interaction); break;
      case 'kick': await this.handleKick(interaction); break;
    }
  }
}
```

2. **Use separate commands:**
```typescript
@Command('admin-ban', 'Ban a user')
@Command('admin-kick', 'Kick a user')
```

### How do I access the database?

Inject `DatabaseService`:

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
    const user = await this.db.user.findUnique({
      where: { id: interaction.user.id }
    });
  }
}
```

## Deployment Questions

### Where should I host my bot?

Popular options:
- **Railway** - Easy deployment, free tier available
- **Heroku** - Simple, but paid plans required
- **DigitalOcean** - VPS with more control
- **AWS EC2** - Scalable but complex
- **Your own server** - Full control, requires maintenance

See [Deployment Guide](./deployment.md).

### How do I keep the bot running 24/7?

Use a process manager:

**PM2 (recommended for VPS):**
```bash
pm2 start dist/main.js --name discord-bot
pm2 startup
pm2 save
```

**Docker:**
```bash
docker-compose up -d
```

**Cloud platforms** handle this automatically.

### Do I need Docker?

No, Docker is optional but recommended for:
- Easy deployment
- Consistent environments
- Built-in database/Redis
- Simple scaling

You can run directly with Node.js if preferred.

### How do I update the bot?

```bash
# Pull latest code
git pull

# Install dependencies
npm ci

# Rebuild
npm run build

# Restart
pm2 restart discord-bot
# or
docker-compose restart bot
```

## Technical Questions

### What is dependency injection?

Dependency injection (DI) automatically provides dependencies to classes instead of manually creating them.

**Without DI:**
```typescript
class MyCommand {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService(); // Manual creation
  }
}
```

**With DI:**
```typescript
class MyCommand {
  constructor(
    @inject(DatabaseService) private db: DatabaseService
  ) {}
  // DatabaseService automatically provided
}
```

Benefits: easier testing, loose coupling, shared instances.

### What are decorators?

Decorators add metadata to classes and methods:

```typescript
@Command('ping', 'Check latency')
@Cooldown(5000)
export class PingCommand extends BaseCommand {
  // Decorators add command metadata
}
```

They make code more declarative and readable.

### Why use Oceanic.js instead of discord.js?

**Oceanic.js advantages:**
- Lighter weight
- Better TypeScript support
- More accurate typing
- Modern architecture
- Better performance

**discord.js advantages:**
- Larger community
- More resources/tutorials
- More battle-tested

Both are excellent choices. This template uses Oceanic.js for its modern design and performance.

### Can I switch to discord.js?

It's possible but requires significant refactoring since the APIs differ. If you need discord.js, consider using a discord.js-based template instead.

### What's Prisma?

Prisma is a modern ORM (Object-Relational Mapping) that:
- Provides type-safe database access
- Auto-generates database client
- Handles migrations
- Supports multiple databases

Learn more: [Prisma Documentation](https://www.prisma.io/docs)

## Performance Questions

### Is this template suitable for large bots?

Yes! The template is designed for production use and includes:
- Efficient caching
- Database connection pooling
- Monitoring and metrics
- Modular architecture for scaling

Bots using this template can handle:
- Thousands of guilds
- Millions of users
- High command volumes

### How do I optimize performance?

1. **Enable caching** for frequently accessed data
2. **Add database indexes** for common queries
3. **Use Redis** for distributed caching
4. **Paginate** large result sets
5. **Monitor** with Prometheus/Grafana
6. **Profile** slow operations

See [Best Practices](./best-practices.md#performance).

### Can I run multiple bot instances?

Yes, but requires coordination:
- **Database** - Shared database for state
- **Redis** - For distributed caching/locking
- **Load balancer** - Distribute load
- **Sharding** - For very large bots (10,000+ guilds)

Most bots don't need multiple instances until reaching 1,000+ guilds.

## Support Questions

### Where can I get help?

1. **Documentation** - Start here
2. **Troubleshooting Guide** - Common issues
3. **GitHub Issues** - Report bugs/ask questions
4. **Oceanic.js Discord** - Library-specific help
5. **Discord API Documentation** - Official Discord docs

### How do I report a bug?

1. Check if it's already reported on [GitHub Issues](https://github.com/0xXrer/Discord-bot-Template/issues)
2. If not, create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs
   - Environment (Node version, OS, etc.)

### Can I contribute?

Yes! Contributions are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

See [Contributing Guidelines](../README.md#contributing).

### Is this template actively maintained?

Yes! The template is maintained by [0xXrer](https://github.com/0xXrer) and community contributors.

Updates include:
- Bug fixes
- Security patches
- New features
- Documentation improvements
- Dependency updates

---

**Still have questions?**

Open an issue on [GitHub](https://github.com/0xXrer/Discord-bot-Template/issues) or check the [documentation](./README.md).
