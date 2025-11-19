# Deployment Guide

Complete guide for deploying your Discord bot to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Monitoring](#monitoring)
- [CI/CD](#cicd)
- [Production Best Practices](#production-best-practices)

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Tested all commands locally
- [ ] Set all required environment variables
- [ ] Configured database (if using database features)
- [ ] Set `NODE_ENV=production`
- [ ] Built the project (`npm run build`)
- [ ] Reviewed and secured sensitive data
- [ ] Set up error logging
- [ ] Configured monitoring

## Docker Deployment

### Using Docker Compose (Recommended)

Docker Compose orchestrates all services (bot, database, metrics, etc.).

**1. Configure Environment**

Create `.env` file:

```env
NODE_ENV=production
BOT_TOKEN=your_production_token
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
OWNER_ID=your_user_id

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/discord_bot
LOG_LEVEL=info

HEALTH_CHECK_PORT=3000
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=true
```

**2. Start Services**

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f bot

# Check status
docker-compose ps

# Stop services
docker-compose down
```

**3. Services Running**

- **Discord Bot** - Main bot application
- **PostgreSQL** - Database (port 5432)
- **Redis** (optional) - Caching (port 6379)
- **Prometheus** (optional) - Metrics collection (port 9090)
- **Grafana** (optional) - Metrics dashboard (port 3001)

**4. Accessing Services**

```bash
# Bot health check
curl http://localhost:3000/health

# Bot metrics
curl http://localhost:3000/metrics

# Grafana dashboard
open http://localhost:3001
# Default credentials: admin/admin
```

### Using Docker Only

**1. Build Image**

```bash
docker build -t discord-bot:latest .
```

**2. Run Container**

```bash
docker run -d \
  --name discord-bot \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  discord-bot:latest
```

**3. Manage Container**

```bash
# View logs
docker logs -f discord-bot

# Stop container
docker stop discord-bot

# Restart container
docker restart discord-bot

# Remove container
docker rm discord-bot
```

## Manual Deployment

### Linux Server (Ubuntu/Debian)

**1. Install Dependencies**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL (if needed)
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2
```

**2. Clone and Build**

```bash
# Clone repository
git clone https://github.com/yourusername/discord-bot.git
cd discord-bot

# Install dependencies
npm ci --production=false

# Build project
npm run build

# Install production dependencies only
rm -rf node_modules
npm ci --production
```

**3. Configure Environment**

```bash
# Create .env file
nano .env

# Add your production configuration
# NODE_ENV=production
# BOT_TOKEN=...
# etc.
```

**4. Database Setup (if using)**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate deploy
```

**5. Start with PM2**

```bash
# Start bot
pm2 start dist/main.js --name discord-bot

# Configure auto-restart on system reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs discord-bot

# Restart
pm2 restart discord-bot
```

**6. Configure Firewall**

```bash
# Allow health check port (if needed)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

## Cloud Platforms

### Railway

**1. Install Railway CLI**

```bash
npm install -g @railway/cli
```

**2. Deploy**

```bash
# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set BOT_TOKEN=your_token
# Add all other variables...

# Deploy
railway up
```

### Heroku

**1. Create Heroku App**

```bash
# Login
heroku login

# Create app
heroku create your-bot-name

# Add PostgreSQL (if needed)
heroku addons:create heroku-postgresql:hobby-dev
```

**2. Configure**

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set BOT_TOKEN=your_token
heroku config:set CLIENT_ID=your_client_id
# etc...
```

**3. Deploy**

```bash
# Deploy via Git
git push heroku main

# View logs
heroku logs --tail

# Scale
heroku ps:scale worker=1
```

**4. Procfile**

Create `Procfile` in project root:

```
worker: node dist/main.js
```

### DigitalOcean

**1. Create Droplet**

- Choose Ubuntu 22.04
- Select appropriate size (minimum: 1GB RAM)
- Add SSH key

**2. Connect and Setup**

```bash
ssh root@your_droplet_ip

# Follow Linux Server deployment steps above
```

**3. Use App Platform (Alternative)**

- Connect GitHub repository
- Configure build command: `npm run build`
- Configure run command: `node dist/main.js`
- Add environment variables
- Deploy

### AWS (EC2)

**1. Launch EC2 Instance**

- Choose Amazon Linux 2 or Ubuntu
- Select t2.micro or larger
- Configure security group (allow SSH, optionally health check port)

**2. Connect and Deploy**

```bash
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20

# Follow Linux Server deployment steps
```

## Monitoring

### Health Checks

The bot exposes health check endpoints:

**Endpoints:**

```bash
# Basic health check
curl http://localhost:3000/health
# Response: {"status": "healthy", "uptime": 123.456}

# Readiness check
curl http://localhost:3000/ready
# Response: {"ready": true, "database": "connected"}

# Metrics (Prometheus format)
curl http://localhost:3000/metrics

# Statistics (JSON)
curl http://localhost:3000/stats
```

### Logging

Configure logging in production:

```env
LOG_LEVEL=info
```

Log levels:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - General information (recommended for production)
- `debug` - Detailed debugging (development only)

### Metrics with Prometheus & Grafana

**1. Start Services**

```bash
docker-compose up -d prometheus grafana
```

**2. Access Grafana**

```
URL: http://localhost:3001
Username: admin
Password: admin
```

**3. Add Prometheus Data Source**

- Go to Configuration → Data Sources
- Add Prometheus
- URL: `http://prometheus:9090`
- Save & Test

**4. Import Dashboard**

- Go to Dashboards → Import
- Upload JSON from `grafana/dashboards/discord-bot.json`
- View metrics

**Metrics Available:**

- Bot uptime
- Command execution count
- Event processing count
- Response time
- Error rate
- Database query count
- Memory usage
- Active guilds/users

### Error Tracking

**Option 1: Sentry**

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});
```

**Option 2: Winston File Logging**

```typescript
// Already configured in src/common/logger/Logger.ts
// Logs are written to logs/ directory
```

## CI/CD

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Production
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          SERVER_IP: ${{ secrets.SERVER_IP }}
        run: |
          # Add SSH key
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa

          # Deploy
          ssh -o StrictHostKeyChecking=no user@$SERVER_IP << 'EOF'
            cd ~/discord-bot
            git pull
            npm ci --production=false
            npm run build
            rm -rf node_modules
            npm ci --production
            pm2 restart discord-bot
          EOF
```

### Docker Hub

```yaml
# .github/workflows/docker.yml
name: Docker

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: yourusername/discord-bot:latest
```

## Production Best Practices

### 1. Environment Variables

Never hardcode secrets:

```typescript
// Bad
const token = 'MTIzNDU2Nzg5MDEyMzQ1Njc4OTA.ABCDEF.XYZ';

// Good
const token = process.env.BOT_TOKEN;
```

### 2. Error Handling

Always catch errors:

```typescript
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection:', error);
  // Don't exit, log and continue
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1); // Exit on fatal errors
});
```

### 3. Graceful Shutdown

Handle termination signals:

```typescript
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await client.disconnect();
  await database.disconnect();
  process.exit(0);
});
```

### 4. Rate Limiting

Respect Discord's rate limits:

```typescript
// Use built-in Oceanic.js rate limiting
// Configure in client options
const client = new Client({
  rest: {
    requestTimeout: 15000,
    disableLatencyCompensation: false
  }
});
```

### 5. Database Connection Pooling

```typescript
// Prisma handles this automatically
// Configure in schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 6. Caching

Use Redis for caching:

```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache frequently accessed data
await redis.set('key', 'value', 'EX', 3600); // 1 hour
const value = await redis.get('key');
```

### 7. Security

- Use HTTPS for all external requests
- Validate all user input
- Sanitize database queries (Prisma does this)
- Keep dependencies updated
- Use environment variables for secrets
- Enable 2FA on Discord account
- Limit bot permissions to minimum required

### 8. Performance

- Use database indexes
- Implement caching
- Paginate large datasets
- Use lazy loading
- Monitor memory usage
- Profile slow operations

### 9. Backup

```bash
# Backup database (PostgreSQL)
pg_dump -U postgres discord_bot > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres discord_bot < backup_20250119.sql

# Automated backups with cron
0 2 * * * pg_dump -U postgres discord_bot > /backups/backup_$(date +\%Y\%m\%d).sql
```

### 10. Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix

# Rebuild
npm run build

# Restart
pm2 restart discord-bot
```

## Troubleshooting Production Issues

### Bot Won't Start

```bash
# Check logs
pm2 logs discord-bot --lines 100

# Check environment variables
pm2 show discord-bot

# Verify build
ls -la dist/

# Test manually
NODE_ENV=production node dist/main.js
```

### High Memory Usage

```bash
# Monitor
pm2 monit

# Check heap
node --max-old-space-size=4096 dist/main.js

# Add to PM2
pm2 start dist/main.js --node-args="--max-old-space-size=4096"
```

### Database Connection Issues

```bash
# Test connection
psql -U postgres -h localhost -d discord_bot

# Check DATABASE_URL
echo $DATABASE_URL

# Verify Prisma client
npm run prisma:generate
```

---

**Related:**
- [Troubleshooting Guide](./troubleshooting.md)
- [Monitoring Setup](./monitoring.md)
- [Security Best Practices](./security.md)
