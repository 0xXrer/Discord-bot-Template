# Troubleshooting Guide

Common issues and their solutions when developing and running your Discord bot.

## Table of Contents

- [Bot Issues](#bot-issues)
- [Command Issues](#command-issues)
- [Database Issues](#database-issues)
- [Build and Compilation](#build-and-compilation)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)

## Bot Issues

### Bot Won't Start

**Error: Invalid token**

```
Error: Invalid token provided
```

**Solution:**
1. Check your `.env` file for `BOT_TOKEN`
2. Ensure no extra spaces or quotes around the token
3. Regenerate token in Discord Developer Portal if needed
4. Verify you're using the bot token, not client secret

```bash
# Check .env file
cat .env | grep BOT_TOKEN

# Should look like:
# BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OTA.ABCDEF.XYZ
```

---

**Error: Missing intents**

```
Error: Privileged intent provided is not enabled or whitelisted
```

**Solution:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to "Bot" section
4. Enable required intents:
   - Message Content Intent (if reading message content)
   - Server Members Intent (if accessing member data)
   - Presence Intent (if tracking user presence)
5. Save changes
6. Restart bot

---

**Bot is offline**

**Possible Causes:**
- Bot token is invalid
- Bot process crashed
- Network connectivity issues
- Discord API outage

**Solution:**

```bash
# Check if process is running
pm2 list
# or
ps aux | grep node

# Check logs
pm2 logs discord-bot
# or
npm run dev

# Verify network
ping discord.com

# Check Discord status
curl https://discordstatus.com/
```

---

### Bot Shows as Online but Doesn't Respond

**Possible Causes:**
- Commands not registered
- Interaction handler not working
- Permissions issues

**Solution:**

```typescript
// Check if ready event fired
@Event('ready')
@Once()
export class ReadyEvent extends BaseEvent {
  async execute(): Promise<void> {
    this.client.logger.info('✅ Bot is ready!'); // Should see this
    await this.client.registerGlobalCommands();
    this.client.logger.info('✅ Commands registered!'); // Should see this
  }
}
```

Check console for these log messages. If missing:
1. Verify `ReadyEvent` is registered in your module
2. Check for errors in console
3. Verify bot has proper gateway connection

---

## Command Issues

### Slash Commands Not Appearing

**Possible Causes:**
- Commands not registered
- Discord needs time to propagate
- Bot missing `applications.commands` scope

**Solution:**

1. **Wait 1-2 minutes** - Discord caches commands
2. **Kick and re-invite bot:**
   ```
   1. Go to Server Settings → Integrations
   2. Remove bot
   3. Re-invite with proper scopes (bot + applications.commands)
   ```
3. **Force refresh Discord:**
   - Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)
4. **Check registration:**
   ```typescript
   // Verify this runs in Ready event
   await this.client.registerGlobalCommands();
   ```

---

### Command Fails with "Unknown Interaction"

```
Interaction has already been acknowledged
```

**Cause:**
You tried to respond to an interaction multiple times or after it expired (3 seconds).

**Solution:**

```typescript
// Bad: Multiple responses
await interaction.createMessage({ content: 'Hello' });
await interaction.createMessage({ content: 'World' }); // ERROR!

// Good: Single response
await interaction.createMessage({ content: 'Hello World' });

// Good: Defer then edit
await interaction.defer();
// ... do work ...
await interaction.editOriginal({ content: 'Done!' });

// Good: Ephemeral then followup
await interaction.createMessage({
  content: 'Processing...',
  flags: MessageFlags.EPHEMERAL
});
await interaction.createFollowup({ content: 'Complete!' });
```

---

### Command Options Not Working

**Error: Cannot read property 'getString' of undefined**

```typescript
const value = interaction.data.options.getString('name'); // undefined
```

**Cause:**
Option name mismatch or option not properly defined.

**Solution:**

```typescript
// Ensure decorator matches usage
@Option({
  name: 'username', // Must match exactly
  description: 'User name',
  type: ApplicationCommandOptionTypes.STRING,
  required: true
})

// Then use same name:
const username = interaction.data.options.getString('username', true);
//                                                    ^^^^^^^^ exact match
```

---

### Permission Denied Errors

**Error: Missing Permissions**

**Cause:**
Bot lacks required permissions in the server.

**Solution:**

1. **Check bot role position:**
   - Bot's role must be higher than target user's highest role
   - Move bot role up in Server Settings → Roles

2. **Check bot permissions:**
   ```typescript
   // In guild settings, verify bot has:
   // - Send Messages
   // - Embed Links
   // - Use External Emojis
   // - Add Reactions
   // - Manage Messages (if needed)
   // - Kick Members (if using kick command)
   // - Ban Members (if using ban command)
   ```

3. **Handle gracefully:**
   ```typescript
   try {
     await interaction.guild!.createBan(userId);
   } catch (error) {
     if (error.code === 50013) {
       await interaction.createMessage({
         content: '❌ I lack the permission to ban this user!',
         flags: MessageFlags.EPHEMERAL
       });
     }
   }
   ```

---

## Database Issues

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Cause:**
PostgreSQL is not running or wrong connection string.

**Solution:**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
# or
docker ps | grep postgres

# Start PostgreSQL
sudo systemctl start postgresql
# or
docker-compose up -d postgres

# Verify DATABASE_URL in .env
echo $DATABASE_URL
# Should be: postgresql://user:password@localhost:5432/dbname
```

---

### Migration Errors

**Error: Migration failed**

```
Error: P1001: Can't reach database server
```

**Solution:**

```bash
# Reset database (WARNING: Deletes all data)
npm run prisma:migrate reset

# Or manually fix:
# 1. Drop database
psql -U postgres -c "DROP DATABASE discord_bot;"

# 2. Create fresh
psql -U postgres -c "CREATE DATABASE discord_bot;"

# 3. Run migrations
npm run prisma:migrate dev

# 4. Generate client
npm run prisma:generate
```

---

### Prisma Client Not Generated

**Error: Cannot find module '@prisma/client'**

**Solution:**

```bash
# Generate Prisma client
npm run prisma:generate

# If still fails, reinstall
rm -rf node_modules
npm install
npm run prisma:generate
```

---

## Build and Compilation

### TypeScript Compilation Errors

**Error: Cannot find module**

```
error TS2307: Cannot find module '@core/base'
```

**Solution:**

Check `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["core/*"],
      "@common/*": ["common/*"],
      "@modules/*": ["modules/*"],
      "@database/*": ["database/*"]
    }
  }
}
```

Then rebuild:

```bash
rm -rf dist/
npm run build
```

---

**Error: Type errors in strict mode**

```
error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'
```

**Solution:**

Use type guards or required parameters:

```typescript
// Bad
const value = interaction.data.options.getString('name');
doSomething(value); // Error: might be undefined

// Good: Use required parameter
const value = interaction.data.options.getString('name', true);
doSomething(value); // OK: guaranteed to be string

// Good: Use type guard
const value = interaction.data.options.getString('name');
if (value) {
  doSomething(value); // OK: checked for undefined
}
```

---

### Decorator Errors

**Error: Decorators are not valid here**

**Solution:**

Ensure `experimentalDecorators` and `emitDecoratorMetadata` are enabled:

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Import `reflect-metadata` at the top of `main.ts`:

```typescript
import 'reflect-metadata';
```

---

## Deployment Issues

### Build Works Locally but Fails in Production

**Possible Causes:**
- Different Node.js versions
- Missing dependencies
- Environment variable differences

**Solution:**

```bash
# Check Node version locally
node --version

# Check on server
ssh server "node --version"

# If different, use nvm:
nvm install 20
nvm use 20

# Ensure devDependencies installed for build
npm ci
npm run build

# Then install production only
rm -rf node_modules
npm ci --production
```

---

### PM2 Won't Start Bot

**Error: Script not found**

```
Error: Script not found: dist/main.js
```

**Solution:**

```bash
# Ensure build exists
ls -la dist/main.js

# If missing, build first
npm run build

# Then start
pm2 start dist/main.js --name discord-bot
```

---

### Docker Container Exits Immediately

**Check logs:**

```bash
docker logs discord-bot

# Common issues:
# 1. Missing BOT_TOKEN
# 2. Database not accessible
# 3. Build failed
```

**Solution:**

```bash
# Verify environment variables
docker exec discord-bot env | grep BOT_TOKEN

# Check if database is accessible
docker exec discord-bot ping postgres

# Rebuild image
docker-compose build --no-cache
docker-compose up -d
```

---

## Performance Issues

### High Memory Usage

**Symptoms:**
- Bot crashes with `JavaScript heap out of memory`
- Memory usage climbs over time

**Solution:**

1. **Increase heap size:**
   ```bash
   node --max-old-space-size=4096 dist/main.js

   # Or with PM2
   pm2 start dist/main.js --node-args="--max-old-space-size=4096"
   ```

2. **Fix memory leaks:**
   ```typescript
   // Bad: Memory leak
   const cache = new Map();
   interaction.data.options.forEach(opt => {
     cache.set(opt.name, opt.value); // Never cleared!
   });

   // Good: Use WeakMap or clear periodically
   const cache = new Map();
   setInterval(() => cache.clear(), 60000); // Clear every minute
   ```

3. **Limit cached data:**
   ```typescript
   // Implement LRU cache
   class LRUCache<K, V> {
     private maxSize: number;
     private cache = new Map<K, V>();

     constructor(maxSize: number) {
       this.maxSize = maxSize;
     }

     set(key: K, value: V): void {
       if (this.cache.size >= this.maxSize) {
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }
       this.cache.set(key, value);
     }
   }
   ```

---

### Slow Command Response

**Solution:**

1. **Use defer for long operations:**
   ```typescript
   await interaction.defer();
   // ... long operation ...
   await interaction.editOriginal({ content: 'Done!' });
   ```

2. **Add database indexes:**
   ```prisma
   model User {
     id    String @id
     email String @unique

     @@index([email]) // Add index for faster queries
   }
   ```

3. **Use database connection pooling:**
   ```typescript
   // Prisma handles this automatically
   // Configure in DATABASE_URL:
   // postgresql://user:pass@localhost:5432/db?connection_limit=10
   ```

4. **Cache frequently accessed data:**
   ```typescript
   const cache = new Map<string, any>();

   async function getGuildSettings(guildId: string) {
     if (cache.has(guildId)) {
       return cache.get(guildId);
     }

     const settings = await db.guild.findUnique({ where: { id: guildId } });
     cache.set(guildId, settings);

     return settings;
   }
   ```

---

## Common Error Codes

### Discord API Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 10003 | Unknown Channel | Channel was deleted or bot lacks access |
| 10004 | Unknown Guild | Guild was deleted or bot was kicked |
| 10008 | Unknown Message | Message was deleted |
| 10062 | Unknown Interaction | Interaction expired (>3s) or already acknowledged |
| 50001 | Missing Access | Bot lacks channel permissions |
| 50013 | Missing Permissions | Bot lacks required permission |
| 50035 | Invalid Form Body | Malformed request data |

**Handle gracefully:**

```typescript
try {
  await interaction.createMessage({ content: 'Hello!' });
} catch (error: any) {
  if (error.code === 10062) {
    this.client.logger.warn('Interaction expired');
    return;
  }
  throw error;
}
```

---

## Getting More Help

### Enable Debug Logging

```env
LOG_LEVEL=debug
```

### Check Oceanic.js Logs

```typescript
const client = new Client({
  // Enable debug logging
  logLevel: 'debug'
});
```

### Useful Commands

```bash
# Check bot process
pm2 list
pm2 show discord-bot

# View recent logs
pm2 logs discord-bot --lines 100

# Monitor in real-time
pm2 monit

# Check system resources
htop

# Check network
netstat -tuln | grep 5432  # PostgreSQL
netstat -tuln | grep 6379  # Redis
```

### Still Stuck?

1. Check [Oceanic.js Documentation](https://docs.oceanic.ws/)
2. Join [Oceanic.js Discord Server](https://discord.gg/oceanic)
3. Open an issue on [GitHub](https://github.com/0xXrer/Discord-bot-Template/issues)
4. Review bot logs carefully
5. Test with minimal reproduction case

---

**Related:**
- [Getting Started](./getting-started.md)
- [Deployment Guide](./deployment.md)
- [API Reference](./api/README.md)
