# FileUtils Class

Utility class for file operations including directory traversal, file existence checking, and JSON file operations. Provides static methods for common file system tasks.

## Methods

### getFiles(directory: string, extension: string = ''): Promise<string[]>

Recursively gets all files in a directory with optional extension filtering.

**Parameters:**
- `directory` - Directory path to scan
- `extension` - File extension filter (e.g., '.ts', '.js')

**Returns:** Promise<string[]> - Array of file paths

**Example:**
```typescript
// Get all TypeScript files
const tsFiles = await FileUtils.getFiles('./src', '.ts');

// Get all files
const allFiles = await FileUtils.getFiles('./src');
```

**Process:**
1. Checks if directory exists
2. Reads directory contents
3. Recursively processes subdirectories
4. Filters files by extension if provided
5. Returns array of file paths

**Error Handling:**
- Returns empty array if directory doesn't exist
- Throws error if directory read fails

### ensureDirectory(directory: string): Promise<void>

Creates a directory and all parent directories if they don't exist.

**Parameters:**
- `directory` - Directory path to create

**Returns:** Promise<void>

**Example:**
```typescript
await FileUtils.ensureDirectory('./logs/2024/01');
```

**Process:**
1. Creates directory with recursive option
2. Handles existing directories gracefully

**Error Handling:**
- Throws error if directory creation fails

### fileExists(filePath: string): Promise<boolean>

Checks if a file exists.

**Parameters:**
- `filePath` - File path to check

**Returns:** Promise<boolean> - true if file exists

**Example:**
```typescript
const exists = await FileUtils.fileExists('./config.json');
if (exists) {
    console.log('Config file exists');
}
```

**Process:**
1. Attempts to access file
2. Returns true if accessible
3. Returns false if not accessible

### readJsonFile<T>(filePath: string): Promise<T>

Reads and parses a JSON file.

**Parameters:**
- `filePath` - Path to JSON file

**Returns:** Promise<T> - Parsed JSON data

**Example:**
```typescript
// Read config file
const config = await FileUtils.readJsonFile<Config>('./config.json');

// Read package.json
const pkg = await FileUtils.readJsonFile<PackageJson>('./package.json');
```

**Process:**
1. Reads file as UTF-8
2. Parses JSON content
3. Returns typed data

**Error Handling:**
- Throws error if file read fails
- Throws error if JSON parsing fails

### writeJsonFile<T>(filePath: string, data: T): Promise<void>

Writes data to a JSON file with formatting.

**Parameters:**
- `filePath` - Path to write file
- `data` - Data to serialize

**Returns:** Promise<void>

**Example:**
```typescript
const config = {
    botToken: 'token',
    clientId: 'id',
    ownerId: 'owner'
};

await FileUtils.writeJsonFile('./config.json', config);
```

**Process:**
1. Ensures parent directory exists
2. Serializes data with 2-space indentation
3. Writes file as UTF-8

**Error Handling:**
- Throws error if directory creation fails
- Throws error if file write fails

## Usage Examples

### Directory Scanning

```typescript
// Get all TypeScript files in src
const tsFiles = await FileUtils.getFiles('./src', '.ts');
console.log(`Found ${tsFiles.length} TypeScript files`);

// Get all JavaScript files
const jsFiles = await FileUtils.getFiles('./dist', '.js');

// Get all files recursively
const allFiles = await FileUtils.getFiles('./src');
```

### File Operations

```typescript
// Check if file exists
if (await FileUtils.fileExists('./data.json')) {
    console.log('Data file exists');
}

// Create directory structure
await FileUtils.ensureDirectory('./logs/2024/01/15');
```

### JSON Operations

```typescript
// Read configuration
interface BotConfig {
    token: string;
    clientId: string;
    ownerId: string;
}

const config = await FileUtils.readJsonFile<BotConfig>('./config.json');
console.log(`Bot token: ${config.token}`);

// Write data
const userData = {
    users: [
        { id: '123', name: 'John' },
        { id: '456', name: 'Jane' }
    ],
    lastUpdated: new Date().toISOString()
};

await FileUtils.writeJsonFile('./users.json', userData);
```

### Error Handling

```typescript
try {
    const files = await FileUtils.getFiles('./nonexistent');
    console.log('Files:', files);
} catch (error) {
    console.error('Failed to read directory:', error.message);
}

try {
    const config = await FileUtils.readJsonFile('./invalid.json');
} catch (error) {
    console.error('Failed to read JSON:', error.message);
}
```

## Integration with Bot Components

### CommandHandler

```typescript
export class CommandHandler {
    public async loadCommands(): Promise<void> {
        const commandsPath = path.join(__dirname, '..', 'commands');
        const files = await FileUtils.getFiles(commandsPath, '.ts');
        
        for (const file of files) {
            // Load command from file
            const commandModule = await import(file);
            // ... process command
        }
    }
}
```

### EventHandler

```typescript
export class EventHandler {
    public async loadEvents(): Promise<void> {
        const eventsPath = path.join(__dirname, '..', 'events');
        const files = await FileUtils.getFiles(eventsPath, '.ts');
        
        for (const file of files) {
            // Load event from file
            const eventModule = await import(file);
            // ... process event
        }
    }
}
```

### Configuration Management

```typescript
// Load configuration from JSON
const config = await FileUtils.readJsonFile<Config>('./config.json');

// Save user data
const userData = {
    userId: '123',
    permissions: ['MANAGE_MESSAGES'],
    lastSeen: new Date()
};

await FileUtils.writeJsonFile(`./data/users/${userId}.json`, userData);
```

## Best Practices

1. **Handle errors gracefully** - Always wrap file operations in try-catch
2. **Use appropriate extensions** - Filter files by extension when possible
3. **Check file existence** - Use `fileExists` before reading files
4. **Ensure directories exist** - Use `ensureDirectory` before writing files
5. **Use TypeScript types** - Leverage generic types for JSON operations
6. **Handle missing files** - Account for files that might not exist
7. **Use relative paths** - Prefer relative paths for portability
8. **Validate JSON data** - Consider validating parsed JSON data
