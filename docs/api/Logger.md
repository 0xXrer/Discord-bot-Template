# Logger Class

Provides structured logging with different levels and formatting. Supports debug, info, warn, and error logging with timestamp and context information.

## Constructor

```typescript
constructor(name: string, level: LogLevel = LogLevel.INFO)
```

Creates a new logger instance.

**Parameters:**
- `name` - Logger name/context
- `level` - Minimum log level (default: INFO)

## LogLevel Enum

```typescript
enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
```

## Properties

### private name: string
Logger name/context identifier.

### private level: LogLevel
Current minimum log level.

## Methods

### debug(message: string, ...args: any[]): void

Logs a debug message.

**Parameters:**
- `message` - Log message
- `...args` - Additional arguments to log

**Example:**
```typescript
logger.debug('User clicked button', { userId: '123', buttonId: 'submit' });
```

### info(message: string, ...args: any[]): void

Logs an info message.

**Parameters:**
- `message` - Log message
- `...args` - Additional arguments to log

**Example:**
```typescript
logger.info('Bot started successfully');
```

### warn(message: string, ...args: any[]): void

Logs a warning message.

**Parameters:**
- `message` - Log message
- `...args` - Additional arguments to log

**Example:**
```typescript
logger.warn('Rate limit approaching', { remaining: 5 });
```

### error(message: string, ...args: any[]): void

Logs an error message.

**Parameters:**
- `message` - Log message
- `...args` - Additional arguments to log

**Example:**
```typescript
logger.error('Failed to connect to database', error);
```

### setLevel(level: LogLevel): void

Sets the minimum log level.

**Parameters:**
- `level` - New minimum log level

**Example:**
```typescript
logger.setLevel(LogLevel.DEBUG);
```

### getLevel(): LogLevel

Gets the current log level.

**Returns:** LogLevel - Current minimum log level

**Example:**
```typescript
const currentLevel = logger.getLevel();
console.log(`Current log level: ${currentLevel}`);
```

## Message Formatting

All log messages are formatted with:
- ISO timestamp
- Log level
- Logger name
- Message content
- Additional arguments (JSON stringified)

**Format:**
```
[timestamp] [LEVEL] [name] message additional_args
```

**Example Output:**
```
[2024-01-15T10:30:45.123Z] [INFO] [BotClient] Bot started successfully
[2024-01-15T10:30:45.124Z] [DEBUG] [CommandHandler] Loaded command: ping
[2024-01-15T10:30:45.125Z] [ERROR] [EventHandler] Failed to load event: {"error": "SyntaxError"}
```

## Usage Examples

### Basic Logging

```typescript
import { Logger, LogLevel } from './utils/Logger';

const logger = new Logger('MyClass');

logger.info('Application started');
logger.debug('Debug information');
logger.warn('Warning message');
logger.error('Error occurred');
```

### With Additional Data

```typescript
const logger = new Logger('UserService');

// Log with object data
logger.info('User created', { 
    userId: '123', 
    username: 'john_doe',
    email: 'john@example.com' 
});

// Log with error
try {
    // Some operation
} catch (error) {
    logger.error('Operation failed', error);
}
```

### Dynamic Log Level

```typescript
const logger = new Logger('ConfigManager');

// Set debug level for development
if (process.env.NODE_ENV === 'development') {
    logger.setLevel(LogLevel.DEBUG);
}

// This will only log in development
logger.debug('Configuration loaded', config);
```

### Different Logger Instances

```typescript
// Create loggers for different components
const botLogger = new Logger('BotClient');
const commandLogger = new Logger('CommandHandler');
const eventLogger = new Logger('EventHandler');

botLogger.info('Bot initialized');
commandLogger.debug('Command loaded: help');
eventLogger.warn('Event handler error');
```

## Log Level Filtering

Messages are only logged if their level is >= the logger's level:

```typescript
const logger = new Logger('Test', LogLevel.WARN);

logger.debug('This will not be logged');  // Level 0 < 2
logger.info('This will not be logged');   // Level 1 < 2
logger.warn('This will be logged');       // Level 2 >= 2
logger.error('This will be logged');      // Level 3 >= 2
```

## Object Serialization

Objects and complex data are automatically JSON stringified:

```typescript
const logger = new Logger('DataProcessor');

const data = {
    users: ['user1', 'user2'],
    config: { timeout: 5000 },
    metadata: { version: '1.0.0' }
};

logger.info('Processing data', data);
// Output: [timestamp] [INFO] [DataProcessor] Processing data {"users":["user1","user2"],"config":{"timeout":5000},"metadata":{"version":"1.0.0"}}
```

## Integration with Bot Components

### BotClient

```typescript
export class BotClient extends Client {
    public logger: Logger;

    constructor(options: ClientOptions) {
        super(options);
        this.logger = new Logger('BotClient');
    }

    public async initialize(): Promise<void> {
        this.logger.info('Initializing bot client...');
        // ... initialization logic
        this.logger.info('Bot client initialized successfully!');
    }
}
```

### CommandHandler

```typescript
export class CommandHandler {
    private logger: Logger;

    constructor(client: BotClient) {
        this.logger = new Logger('CommandHandler');
    }

    public async loadCommands(): Promise<void> {
        this.logger.info('Loading commands...');
        // ... loading logic
        this.logger.info(`Loaded ${this.commands.size} commands`);
    }
}
```

## Best Practices

1. **Use descriptive logger names** - Make it clear which component is logging
2. **Log at appropriate levels** - Use debug for development info, error for problems
3. **Include context** - Add relevant data to help with debugging
4. **Handle sensitive data** - Don't log passwords or tokens
5. **Use consistent formatting** - Keep log messages clear and consistent
6. **Set appropriate levels** - Use different levels for different environments
7. **Log errors with context** - Include error objects and relevant state
