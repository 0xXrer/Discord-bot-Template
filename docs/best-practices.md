# Best Practices

Guidelines and recommendations for building high-quality Discord bots.

## Code Organization

### Use Modules for Features

Organize related functionality into modules:

```
✅ Good Structure:
modules/
  ├── economy/
  ├── moderation/
  └── leveling/

❌ Bad Structure:
commands/
  ├── balance.ts
  ├── ban.ts
  ├── level.ts
  └── daily.ts
```

### Follow Single Responsibility Principle

Each class/function should have one clear purpose:

```typescript
// ✅ Good: Focused responsibility
class UserService {
  async getUser(id: string) { }
  async updateUser(id: string, data: any) { }
  async deleteUser(id: string) { }
}

// ❌ Bad: Too many responsibilities
class MegaService {
  async getUser(id: string) { }
  async sendMessage(channelId: string) { }
  async banUser(guildId: string, userId: string) { }
  async calculateStats() { }
}
```

## Command Design

### Provide Clear Descriptions

```typescript
// ✅ Good
@Command('ban', 'Ban a user from the server')

// ❌ Bad
@Command('ban', 'ban')
```

### Use Appropriate Option Types

```typescript
// ✅ Good: Use USER type for users
@Option({
  name: 'target',
  type: ApplicationCommandOptionTypes.USER
})

// ❌ Bad: Use STRING and parse manually
@Option({
  name: 'target',
  type: ApplicationCommandOptionTypes.STRING // Then parse user mention
})
```

### Always Provide Feedback

```typescript
// ✅ Good
await interaction.createMessage({ content: '✅ Settings saved!' });

// ❌ Bad: No response
// (User sees "The application did not respond")
```

### Use Ephemeral for Private Messages

```typescript
// ✅ Good: Error messages are private
await interaction.createMessage({
  content: '❌ You lack permissions!',
  flags: MessageFlags.EPHEMERAL
});

// ❌ Bad: Errors visible to everyone
await interaction.createMessage({
  content: '❌ You lack permissions!'
});
```

## Error Handling

### Always Catch Errors

```typescript
// ✅ Good
async execute(interaction: CommandInteraction): Promise<void> {
  try {
    await this.performAction();
  } catch (error) {
    this.client.logger.error('Command error:', error);
    await this.handleError(interaction, error);
  }
}

// ❌ Bad: Unhandled errors crash bot
async execute(interaction: CommandInteraction): Promise<void> {
  await this.performAction(); // May throw!
}
```

### Provide User-Friendly Error Messages

```typescript
// ✅ Good
catch (error) {
  await interaction.createMessage({
    content: '❌ Failed to ban user. Please check my permissions.',
    flags: MessageFlags.EPHEMERAL
  });
}

// ❌ Bad
catch (error) {
  await interaction.createMessage({
    content: error.stack // Technical jargon
  });
}
```

### Log Errors with Context

```typescript
// ✅ Good
this.client.logger.error('Ban command failed', {
  user: interaction.user.id,
  guild: interaction.guildID,
  target: targetUser.id,
  error
});

// ❌ Bad
console.error(error);
```

## Database

### Use Transactions for Related Operations

```typescript
// ✅ Good
await this.db.$transaction([
  this.db.user.update({ where: { id: fromId }, data: { balance: { decrement: amount } } }),
  this.db.user.update({ where: { id: toId }, data: { balance: { increment: amount } } })
]);

// ❌ Bad: Can leave inconsistent state
await this.db.user.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
await this.db.user.update({ where: { id: toId }, data: { balance: { increment: amount } } });
// What if second update fails?
```

### Add Indexes for Frequent Queries

```prisma
// ✅ Good
model Warning {
  id      String @id
  userId  String
  guildId String

  @@index([userId, guildId]) // Fast lookups
}

// ❌ Bad: No indexes = slow queries
model Warning {
  id      String @id
  userId  String
  guildId String
}
```

### Use Prepared Statements (Automatic with Prisma)

```typescript
// ✅ Good: Prisma prevents SQL injection
await this.db.user.findUnique({
  where: { id: userId }
});

// ❌ Bad: Raw SQL vulnerable to injection
await this.db.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
```

## Security

### Never Expose Sensitive Data

```typescript
// ✅ Good
this.client.logger.info('User authenticated', { userId: user.id });

// ❌ Bad
this.client.logger.info('User authenticated', {
  userId: user.id,
  token: user.apiToken // Logged in plain text!
});
```

### Validate User Input

```typescript
// ✅ Good
const amount = interaction.data.options.getInteger('amount', true);
if (amount < 1 || amount > 1000000) {
  await interaction.createMessage({
    content: '❌ Amount must be between 1 and 1,000,000',
    flags: MessageFlags.EPHEMERAL
  });
  return;
}

// ❌ Bad: Trust user input blindly
const amount = interaction.data.options.getInteger('amount', true);
await this.transferMoney(amount);
```

### Use Environment Variables for Secrets

```typescript
// ✅ Good
const token = process.env.BOT_TOKEN;
const apiKey = process.env.API_KEY;

// ❌ Bad
const token = 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTA.ABCDEF';
const apiKey = 'sk_live_123456789';
```

## Performance

### Use Cooldowns to Prevent Spam

```typescript
@Command('search', 'Search the web')
@Cooldown(10000) // 10 second cooldown
export class SearchCommand extends BaseCommand { }
```

### Cache Frequently Accessed Data

```typescript
// ✅ Good
private guildSettingsCache = new Map<string, GuildSettings>();

async getGuildSettings(guildId: string): Promise<GuildSettings> {
  if (this.guildSettingsCache.has(guildId)) {
    return this.guildSettingsCache.get(guildId)!;
  }

  const settings = await this.db.guild.findUnique({ where: { id: guildId } });
  this.guildSettingsCache.set(guildId, settings);

  return settings;
}

// ❌ Bad: Query database every time
async getGuildSettings(guildId: string): Promise<GuildSettings> {
  return await this.db.guild.findUnique({ where: { id: guildId } });
}
```

### Defer Long-Running Operations

```typescript
// ✅ Good: Show "thinking..." for long operations
async execute(interaction: CommandInteraction): Promise<void> {
  await interaction.defer();

  const result = await this.longOperation();

  await interaction.editOriginal({ content: result });
}

// ❌ Bad: User sees error after 3 seconds
async execute(interaction: CommandInteraction): Promise<void> {
  const result = await this.longOperation(); // Takes 5 seconds

  await interaction.createMessage({ content: result }); // Error: Interaction expired
}
```

### Paginate Large Results

```typescript
// ✅ Good
const warnings = await this.db.warning.findMany({
  where: { userId },
  take: 10,
  skip: page * 10
});

// ❌ Bad: Load all data
const warnings = await this.db.warning.findMany({
  where: { userId }
}); // Could be thousands!
```

## Testing

### Write Tests for Critical Logic

```typescript
// tests/services/economy.test.ts
describe('EconomyService', () => {
  it('should transfer money correctly', async () => {
    const service = new EconomyService(mockDb);

    await service.transfer('user1', 'user2', 100);

    expect(mockDb.user.update).toHaveBeenCalledTimes(2);
  });

  it('should fail transfer with insufficient balance', async () => {
    const service = new EconomyService(mockDb);

    const result = await service.transfer('user1', 'user2', 9999999);

    expect(result).toBe(false);
  });
});
```

### Use Dependency Injection for Testability

```typescript
// ✅ Good: Easy to mock
constructor(
  client: ExtendedClient,
  @inject(DatabaseService) private db: DatabaseService
) {
  super(client);
}

// ❌ Bad: Hard to test
constructor(client: ExtendedClient) {
  super(client);
  this.db = new DatabaseService(); // Can't mock!
}
```

## Logging

### Use Appropriate Log Levels

```typescript
// ✅ Good
this.client.logger.debug('Processing message', { id: message.id });
this.client.logger.info('Command executed', { command: this.name });
this.client.logger.warn('Rate limit approaching', { remaining: 5 });
this.client.logger.error('Database connection failed', error);

// ❌ Bad: Everything at same level
console.log('Processing message');
console.log('Command executed');
console.log('Rate limit approaching');
console.log('Database connection failed');
```

### Include Context in Logs

```typescript
// ✅ Good
this.client.logger.error('Command failed', {
  command: this.name,
  user: interaction.user.id,
  guild: interaction.guildID,
  error: error.message
});

// ❌ Bad
this.client.logger.error('Command failed');
```

## Deployment

### Use Environment Variables

```bash
# ✅ Good: .env file
NODE_ENV=production
BOT_TOKEN=xxx
DATABASE_URL=postgresql://...

# ❌ Bad: Hardcoded in code
const config = {
  env: 'production',
  token: 'xxx',
  database: 'postgresql://...'
};
```

### Implement Health Checks

```typescript
// ✅ Good: Monitor bot health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    guilds: client.guilds.size
  });
});
```

### Graceful Shutdown

```typescript
// ✅ Good
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down');
  await client.disconnect();
  await database.disconnect();
  process.exit(0);
});

// ❌ Bad: Abrupt termination
process.on('SIGTERM', () => {
  process.exit(0); // Leaves connections open!
});
```

## Documentation

### Comment Complex Logic

```typescript
// ✅ Good
/**
 * Calculates exponential backoff for retry attempts.
 * @param attempt - Current retry attempt (0-indexed)
 * @returns Delay in milliseconds
 */
function getBackoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}

// ❌ Bad: No explanation
function getBackoffDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000);
}
```

### Keep README Updated

Update documentation when adding features:
- New commands
- New environment variables
- Changed dependencies
- Modified setup steps

## Git Practices

### Write Meaningful Commit Messages

```bash
# ✅ Good
git commit -m "feat: add economy module with balance and transfer commands"
git commit -m "fix: resolve memory leak in message cache"
git commit -m "docs: update deployment guide with Docker instructions"

# ❌ Bad
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "asdf"
```

### Keep .gitignore Updated

```gitignore
# Environment
.env
.env.local

# Dependencies
node_modules/

# Build output
dist/

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## Summary

Key takeaways:
- **Organize code into modules**
- **Handle all errors gracefully**
- **Validate user input**
- **Use appropriate log levels**
- **Cache frequently accessed data**
- **Write tests for critical logic**
- **Never expose secrets**
- **Always provide user feedback**
- **Document complex logic**
- **Keep dependencies updated**

---

Following these practices will result in a more maintainable, secure, and performant Discord bot.
