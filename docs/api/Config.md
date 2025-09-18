# Config Class

Manages environment configuration and validation. Loads environment variables and provides type-safe access to configuration values.

## Constructor

```typescript
constructor()
```

Creates a new config instance and loads environment variables.

**Process:**
1. Loads environment variables from process.env
2. Validates required variables
3. Sets default values for optional variables

## Properties

### readonly botToken: string
Discord bot token (required).

### readonly clientId: string
Discord client ID (required).

### readonly clientSecret: string
Discord client secret (required).

### readonly ownerId: string
Bot owner user ID (optional, defaults to empty string).

### readonly environment: string
Node environment (defaults to 'development').

### readonly logLevel: string
Log level (defaults to 'info').

### readonly databaseUrl?: string
Database connection URL (optional).

## Methods

### isDevelopment(): boolean

Checks if running in development mode.

**Returns:** boolean - true if NODE_ENV is 'development'

**Example:**
```typescript
if (config.isDevelopment()) {
    console.log('Running in development mode');
}
```

### isProduction(): boolean

Checks if running in production mode.

**Returns:** boolean - true if NODE_ENV is 'production'

**Example:**
```typescript
if (config.isProduction()) {
    console.log('Running in production mode');
}
```

## Environment Variables

### Required Variables

- `BOT_TOKEN` - Discord bot token
- `CLIENT_ID` - Discord application client ID
- `CLIENT_SECRET` - Discord application client secret

### Optional Variables

- `OWNER_ID` - Bot owner user ID (defaults to empty string)
- `NODE_ENV` - Environment mode (defaults to 'development')
- `LOG_LEVEL` - Log level (defaults to 'info')
- `DATABASE_URL` - Database connection URL (optional)

## Validation

The constructor validates required environment variables and throws errors if missing:

```typescript
private validate(): void {
    if (!this.botToken) {
        throw new Error('BOT_TOKEN is required');
    }

    if (!this.clientId) {
        throw new Error('CLIENT_ID is required');
    }

    if (!this.clientSecret) {
        throw new Error('CLIENT_SECRET is required');
    }
}
```

## Usage Examples

### Basic Usage

```typescript
import { Config } from './config/Config';

const config = new Config();

console.log(`Bot token: ${config.botToken}`);
console.log(`Client ID: ${config.clientId}`);
console.log(`Environment: ${config.environment}`);
```

### Environment Checks

```typescript
const config = new Config();

if (config.isDevelopment()) {
    console.log('Development mode - enabling debug features');
    // Enable debug logging, hot reload, etc.
}

if (config.isProduction()) {
    console.log('Production mode - enabling optimizations');
    // Enable production optimizations
}
```

### Database Configuration

```typescript
const config = new Config();

if (config.databaseUrl) {
    console.log('Database URL configured');
    // Connect to database
} else {
    console.log('No database configured');
    // Use in-memory storage
}
```

### Log Level Configuration

```typescript
const config = new Config();

// Set logger level based on config
const logger = new Logger('MyClass');
if (config.logLevel === 'debug') {
    logger.setLevel(LogLevel.DEBUG);
}
```

## Environment File Setup

Create a `.env` file in your project root:

```env
# Discord Bot Configuration
BOT_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
OWNER_ID=your_user_id_here

# Environment
NODE_ENV=development

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/botdb

# Logging
LOG_LEVEL=info
```

## Integration with Bot Components

### BotClient

```typescript
export class BotClient extends Client {
    public config: Config;

    constructor(options: ClientOptions) {
        super(options);
        this.config = new Config();
    }

    public async initialize(): Promise<void> {
        this.logger.info(`Starting bot in ${this.config.environment} mode`);
        // ... initialization
    }
}
```

### PermissionManager

```typescript
export class PermissionManager {
    constructor(client: BotClient) {
        // Set owner permissions
        if (client.config.ownerId) {
            this.setUserPermissions(client.config.ownerId, {
                userId: client.config.ownerId,
                permissions: ['*'],
                level: PermissionManager.PERMISSION_LEVELS.OWNER
            });
        }
    }
}
```

### Logger

```typescript
export class Logger {
    constructor(name: string, level: LogLevel = LogLevel.INFO) {
        this.name = name;
        this.level = level;
    }
}

// Usage with config
const config = new Config();
const logger = new Logger('MyClass', config.logLevel as LogLevel);
```

## Error Handling

The config class throws errors for missing required variables:

```typescript
try {
    const config = new Config();
} catch (error) {
    console.error('Configuration error:', error.message);
    // Handle missing environment variables
}
```

## Type Safety

The config class provides type-safe access to environment variables:

```typescript
// TypeScript knows these are strings
const token: string = config.botToken;
const clientId: string = config.clientId;

// TypeScript knows this might be undefined
const dbUrl: string | undefined = config.databaseUrl;
```

## Best Practices

1. **Validate early** - Check configuration at startup
2. **Use environment files** - Keep sensitive data in .env files
3. **Set defaults** - Provide sensible defaults for optional values
4. **Handle missing values** - Gracefully handle missing environment variables
5. **Use type safety** - Leverage TypeScript for configuration access
6. **Document variables** - Document all environment variables
7. **Keep secrets secure** - Never commit .env files to version control
8. **Use different configs** - Use different .env files for different environments
