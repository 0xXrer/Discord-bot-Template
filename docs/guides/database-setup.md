# Database Setup Guide

This guide explains how to set up and use the database in the Discord Bot Template v2.0.

## Overview

The bot uses:
- **Prisma** - Modern TypeScript ORM
- **PostgreSQL** - Production database
- **DatabaseService** - Wrapper service for database operations

## Initial Setup

### 1. Start PostgreSQL

**Using Docker (Recommended):**
```bash
docker-compose up -d postgres
```

**Using Local PostgreSQL:**
Make sure PostgreSQL is running on your machine.

### 2. Configure Database URL

Edit `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/discord_bot
```

For Docker setup:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/discord_bot
```

### 3. Run Migrations

```bash
npm run prisma:migrate
```

This creates the database schema based on `prisma/schema.prisma`.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates TypeScript types and client based on your schema.

## Prisma Schema

The schema is defined in `prisma/schema.prisma`:

```prisma
model Guild {
  id        String   @id
  prefix    String   @default("!")
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  warnings Warning[]
  @@map("guilds")
}

model User {
  id          String   @id
  permissions String[]
  level       Int      @default(0)
  experience  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  warnings Warning[]
  @@map("users")
}

model Warning {
  id        String   @id @default(cuid())
  userId    String
  guildId   String
  reason    String
  moderator String
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  guild Guild @relation(fields: [guildId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([guildId])
  @@map("warnings")
}
```

## Using DatabaseService

The `DatabaseService` provides convenient methods for database operations.

### Inject DatabaseService

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

  // Use this.database in execute()
}
```

### Guild Operations

```typescript
// Get guild
const guild = await this.database.getGuild(guildId);

// Create guild
const guild = await this.database.createGuild(guildId, {
  prefix: '!',
  settings: { welcomeMessage: true },
});

// Update guild
await this.database.updateGuild(guildId, {
  prefix: '?',
});

// Get or create guild
const guild = await this.database.getOrCreateGuild(guildId);
```

### User Operations

```typescript
// Get user
const user = await this.database.getUser(userId);

// Create user
const user = await this.database.createUser(userId, {
  level: 1,
  permissions: ['MODERATOR'],
});

// Update user
await this.database.updateUser(userId, {
  level: 5,
  experience: 1000,
});

// Get or create user
const user = await this.database.getOrCreateUser(userId);
```

### Warning Operations

```typescript
// Create warning
await this.database.createWarning({
  userId: targetUser.id,
  guildId: interaction.guildID!,
  reason: 'Spam',
  moderator: interaction.user.id,
});

// Get warnings
const warnings = await this.database.getWarnings(userId, guildId);

// Get warning count
const count = await this.database.getWarningCount(userId, guildId);

// Delete warning
await this.database.deleteWarning(warningId);
```

### Command Usage Tracking

```typescript
// Log command usage
await this.database.logCommandUsage({
  commandName: 'ping',
  userId: interaction.user.id,
  guildId: interaction.guildID,
});

// Get usage stats
const stats = await this.database.getCommandUsageStats('ping');
```

## Adding New Models

### 1. Update Schema

Edit `prisma/schema.prisma`:

```prisma
model Economy {
  id      String @id
  userId  String @unique
  balance Int    @default(0)
  bank    Int    @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("economy")
}
```

### 2. Create Migration

```bash
npm run prisma:migrate
```

Name your migration descriptively (e.g., "add-economy-model").

### 3. Generate Client

```bash
npm run prisma:generate
```

### 4. Add Methods to DatabaseService

```typescript
// In src/database/database.service.ts
public async getEconomy(userId: string) {
  return this.prisma.economy.findUnique({ where: { userId } });
}

public async createEconomy(userId: string, balance: number = 0) {
  return this.prisma.economy.create({
    data: { userId, balance },
  });
}

public async updateBalance(userId: string, amount: number) {
  return this.prisma.economy.update({
    where: { userId },
    data: { balance: { increment: amount } },
  });
}
```

## Direct Prisma Client Access

For complex queries, access the Prisma client directly:

```typescript
const result = await this.database.client.$queryRaw`
  SELECT * FROM users WHERE level > 10
`;

// Or using Prisma query builder
const users = await this.database.client.user.findMany({
  where: {
    level: { gte: 10 },
  },
  include: {
    warnings: true,
  },
  orderBy: {
    level: 'desc',
  },
  take: 10,
});
```

## Prisma Studio

View and edit your database with Prisma Studio:

```bash
npm run prisma:studio
```

Opens a web interface at `http://localhost:5555`.

## Transactions

Use transactions for multiple related operations:

```typescript
const result = await this.database.client.$transaction(async (prisma) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { experience: { increment: 100 } },
  });

  if (user.experience >= 1000) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: { increment: 1 }, experience: 0 },
    });
  }

  return user;
});
```

## Error Handling

Always handle database errors:

```typescript
try {
  const user = await this.database.getOrCreateUser(userId);
  // Use user...
} catch (error) {
  this.client.logger.error('Database error:', error);
  await interaction.createMessage({
    content: '❌ Database error occurred.',
    flags: 64,
  });
}
```

## Performance Tips

1. **Use indexes** - Add `@@index` for frequently queried fields
2. **Limit results** - Use `take` to limit query results
3. **Select specific fields** - Use `select` to fetch only needed fields
4. **Use transactions** - For related operations
5. **Connection pooling** - Prisma handles this automatically

## Testing with Database

For tests, use a separate test database:

```typescript
// In test setup
beforeAll(async () => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/discord_bot_test';
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await database.client.user.deleteMany();
  await database.client.guild.deleteMany();
});
```

## Backup and Restore

### Backup

```bash
pg_dump -U postgres discord_bot > backup.sql
```

### Restore

```bash
psql -U postgres discord_bot < backup.sql
```

## Common Issues

### Migration Failed

Reset database and reapply migrations:
```bash
npx prisma migrate reset
```

### Connection Refused

Check if PostgreSQL is running:
```bash
docker-compose ps
```

### Type Errors After Schema Change

Regenerate Prisma client:
```bash
npm run prisma:generate
```

## Production Considerations

1. **Use connection pooling** - Set in DATABASE_URL
2. **Enable SSL** - Add `?sslmode=require` to DATABASE_URL
3. **Regular backups** - Automate with cron jobs
4. **Monitor performance** - Use Prisma logging
5. **Handle migrations** - Use `prisma migrate deploy` in production
