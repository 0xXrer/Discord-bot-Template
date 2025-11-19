# Getting Started

This guide will walk you through setting up and running the Discord Bot Template v2.0 from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 8.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (optional, for database features) ([Download](https://www.postgresql.org/download/))
- **Docker** (optional, for containerized deployment) ([Download](https://www.docker.com/))

Check your installations:
```bash
node --version   # Should be v18.0.0 or higher
npm --version    # Should be 8.0.0 or higher
git --version    # Any recent version
```

## Discord Application Setup

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name and click "Create"

### 2. Create a Bot User

1. Navigate to the "Bot" section in the left sidebar
2. Click "Add Bot" and confirm
3. Under the bot's username, click "Reset Token" to reveal your bot token
4. **Copy this token** - you'll need it for the `.env` file
5. **Important**: Never share your bot token publicly!

### 3. Configure Bot Settings

In the "Bot" section:
- Enable "Message Content Intent" if you plan to read message content
- Enable "Server Members Intent" if you need access to member data
- Enable "Presence Intent" if you need presence updates

### 4. Get Application Credentials

1. Go to the "General Information" section
2. Copy the **Application ID** (this is your `CLIENT_ID`)
3. Go to the "OAuth2" section
4. Copy the **Client Secret** (this is your `CLIENT_SECRET`)

### 5. Get Your User ID

1. Open Discord and enable Developer Mode:
   - User Settings → Advanced → Developer Mode
2. Right-click your username and select "Copy User ID"
3. This is your `OWNER_ID`

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/0xXrer/Discord-bot-Template.git
cd Discord-bot-Template
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- oceanic.js (Discord API wrapper)
- TypeScript
- tsyringe (Dependency injection)
- Prisma (Database ORM)
- Winston (Logging)
- And more...

## Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Open `.env` in your text editor and fill in your credentials:

```env
# Discord Bot Configuration (REQUIRED)
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
CLIENT_SECRET=your_client_secret_here

# Bot Owner (RECOMMENDED)
OWNER_ID=your_discord_user_id_here

# Environment (OPTIONAL)
NODE_ENV=development
LOG_LEVEL=debug

# Database (OPTIONAL - only if using database features)
DATABASE_URL=postgresql://user:password@localhost:5432/discord_bot

# Health Check Server (OPTIONAL)
HEALTH_CHECK_PORT=3000
HEALTH_CHECK_ENABLED=true

# Metrics (OPTIONAL)
METRICS_ENABLED=true
```

### Environment Variable Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `BOT_TOKEN` | Yes | Your Discord bot token | - |
| `CLIENT_ID` | Yes | Your Discord application ID | - |
| `CLIENT_SECRET` | Yes | Your Discord client secret | - |
| `OWNER_ID` | Recommended | Your Discord user ID (for owner-only commands) | - |
| `NODE_ENV` | No | Environment mode: `development` or `production` | `development` |
| `LOG_LEVEL` | No | Logging level: `debug`, `info`, `warn`, `error` | `info` |
| `DATABASE_URL` | No | PostgreSQL connection string | - |
| `HEALTH_CHECK_PORT` | No | Port for health check server | `3000` |
| `HEALTH_CHECK_ENABLED` | No | Enable health check endpoints | `true` |
| `METRICS_ENABLED` | No | Enable Prometheus metrics | `true` |

## Database Setup (Optional)

If you want to use database features (like the warn system), set up PostgreSQL:

### Option 1: Using Docker

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with:
- **Database**: `discord_bot`
- **Username**: `postgres`
- **Password**: `postgres`

### Option 2: Manual Installation

1. Install PostgreSQL on your system
2. Create a database:
   ```bash
   psql -U postgres
   CREATE DATABASE discord_bot;
   \q
   ```
3. Update `DATABASE_URL` in `.env` with your connection string

### Run Migrations

After PostgreSQL is running, initialize the database:

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

## Running the Bot

### Development Mode

For development with hot-reload (automatically restarts on file changes):

```bash
npm run dev
```

You should see output like:
```
[2025-11-19 10:00:00] INFO: Starting Discord Bot...
[2025-11-19 10:00:01] INFO: Loading modules...
[2025-11-19 10:00:01] INFO: Module loaded: GeneralModule
[2025-11-19 10:00:01] INFO: Module loaded: ModerationModule
[2025-11-19 10:00:02] INFO: Bot is ready! Logged in as BotName#1234
[2025-11-19 10:00:02] INFO: Serving 5 guilds with 1,234 users
[2025-11-19 10:00:02] INFO: Health check server listening on port 3000
```

### Production Mode

For production deployment:

```bash
# Build TypeScript to JavaScript
npm run build

# Start the bot
npm start
```

Or use PM2 for process management:

```bash
npm install -g pm2
pm2 start dist/main.js --name discord-bot
pm2 save
pm2 startup
```

## Inviting Your Bot

### 1. Generate Invite Link

Use the Discord Developer Portal to generate an invite link:

1. Go to your application in the [Developer Portal](https://discord.com/developers/applications)
2. Navigate to "OAuth2" → "URL Generator"
3. Select scopes:
   - `bot`
   - `applications.commands`
4. Select bot permissions based on your needs:
   - At minimum: `Send Messages`, `Embed Links`, `Use Slash Commands`
   - For moderation: `Kick Members`, `Ban Members`, `Manage Messages`
5. Copy the generated URL

### 2. Invite to Test Server

1. Paste the URL in your browser
2. Select a server you own (for testing)
3. Click "Authorize"

### 3. Test Commands

In Discord, type `/` to see your bot's commands:
- `/ping` - Check if the bot is responding
- `/help` - See all available commands
- `/info` - View bot information

## Verify Installation

### Check Bot Status

1. **Bot is online**: The bot should appear online in your Discord server
2. **Commands registered**: Type `/` to see slash commands
3. **Logs are working**: Check console output for log messages

### Test Health Endpoint

If health checks are enabled:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2025-11-19T10:00:00.000Z"
}
```

### View Metrics

```bash
curl http://localhost:3000/metrics
```

This returns Prometheus-formatted metrics.

## Next Steps

Now that your bot is running, you can:

1. **[Create Custom Commands](./guides/creating-commands.md)** - Add your own slash commands
2. **[Handle Events](./guides/creating-events.md)** - Respond to Discord events
3. **[Organize with Modules](./guides/creating-modules.md)** - Structure your bot's features
4. **[Understand the Architecture](./architecture.md)** - Learn how the bot works internally
5. **[Deploy to Production](./deployment.md)** - Take your bot live

## Troubleshooting

### Bot won't start

**Error: Invalid token**
- Double-check your `BOT_TOKEN` in `.env`
- Make sure there are no extra spaces or quotes
- Generate a new token in the Developer Portal if needed

**Error: Missing intents**
- Enable required intents in the Discord Developer Portal under "Bot" section
- Update intent configuration in `src/main.ts` if needed

### Commands not showing

**Slash commands not appearing:**
- Wait 1-2 minutes for Discord to register commands
- Kick and re-invite the bot to refresh permissions
- Check console for registration errors

### Database errors

**Connection refused:**
- Make sure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check PostgreSQL logs for errors

**Migration errors:**
- Delete `prisma/migrations` folder
- Run `npm run prisma:migrate` again
- Or use `npx prisma migrate reset` to reset database

### Still having issues?

Check the **[Troubleshooting Guide](./troubleshooting.md)** or open an issue on [GitHub](https://github.com/0xXrer/Discord-bot-Template/issues).

## Useful Commands

```bash
# Development
npm run dev              # Start with hot-reload
npm run build            # Compile TypeScript
npm start                # Run production build

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open database GUI

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Fix code style issues
npm run format           # Format code with Prettier
npm test                 # Run tests

# Docker
npm run docker:build     # Build Docker image
npm run docker:up        # Start with Docker Compose
npm run docker:down      # Stop Docker containers
```

---

**Next**: [Architecture Overview](./architecture.md) →
