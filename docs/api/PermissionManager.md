# PermissionManager Class

Handles user permissions and access control. Provides a flexible permission system with support for different permission levels and guild-specific permissions.

## Constructor

```typescript
constructor(client: BotClient)
```

Creates a new permission manager instance.

**Parameters:**
- `client` - BotClient instance

## Properties

### private client: BotClient
Reference to the bot client.

### private logger: Logger
Logger instance for this manager.

### private userPermissions: Map<string, UserPermissions>
Map storing user permissions.

### static readonly PERMISSION_LEVELS
Static object containing permission level constants.

## Permission Levels

```typescript
static readonly PERMISSION_LEVELS = {
    USER: 0,        // Regular user
    MODERATOR: 1,   // Moderator level
    ADMIN: 2,       // Administrator level
    OWNER: 3        // Bot owner level
};
```

## UserPermissions Interface

```typescript
interface UserPermissions {
    userId: string;         // User ID
    guildId?: string;       // Guild ID (optional for global permissions)
    permissions: string[];  // Array of permission strings
    level: number;          // Permission level (0-3)
}
```

## Methods

### hasPermission(userId: string, guildId?: string, requiredPermissions: string[] = []): Promise<boolean>

Checks if a user has the required permissions.

**Parameters:**
- `userId` - User ID to check
- `guildId` - Guild ID (optional)
- `requiredPermissions` - Array of required permissions

**Returns:** Promise<boolean> - true if user has all required permissions

**Process:**
1. Gets user permissions
2. Checks if user has wildcard permission (*)
3. Verifies all required permissions are present

**Example:**
```typescript
const hasPermission = await permissionManager.hasPermission(
    '123456789',
    '987654321',
    ['MANAGE_MESSAGES', 'KICK_MEMBERS']
);
```

### getUserPermissions(userId: string, guildId?: string): UserPermissions | undefined

Gets user permissions.

**Parameters:**
- `userId` - User ID
- `guildId` - Guild ID (optional)

**Returns:** UserPermissions object or undefined if not found.

**Example:**
```typescript
const perms = permissionManager.getUserPermissions('123456789', '987654321');
if (perms) {
    console.log(`User has permissions: ${perms.permissions.join(', ')}`);
}
```

### setUserPermissions(userId: string, permissions: UserPermissions): void

Sets user permissions.

**Parameters:**
- `userId` - User ID
- `permissions` - UserPermissions object

**Example:**
```typescript
permissionManager.setUserPermissions('123456789', {
    userId: '123456789',
    guildId: '987654321',
    permissions: ['MANAGE_MESSAGES'],
    level: PermissionManager.PERMISSION_LEVELS.MODERATOR
});
```

### removeUserPermissions(userId: string, guildId?: string): boolean

Removes user permissions.

**Parameters:**
- `userId` - User ID
- `guildId` - Guild ID (optional)

**Returns:** boolean - true if permissions were removed

**Example:**
```typescript
const removed = permissionManager.removeUserPermissions('123456789', '987654321');
```

### addPermission(userId: string, permission: string, guildId?: string): void

Adds a permission to a user.

**Parameters:**
- `userId` - User ID
- `permission` - Permission to add
- `guildId` - Guild ID (optional)

**Example:**
```typescript
permissionManager.addPermission('123456789', 'MANAGE_MESSAGES', '987654321');
```

### removePermission(userId: string, permission: string, guildId?: string): void

Removes a permission from a user.

**Parameters:**
- `userId` - User ID
- `permission` - Permission to remove
- `guildId` - Guild ID (optional)

**Example:**
```typescript
permissionManager.removePermission('123456789', 'MANAGE_MESSAGES', '987654321');
```

### getPermissionLevel(userId: string, guildId?: string): number

Gets user's permission level.

**Parameters:**
- `userId` - User ID
- `guildId` - Guild ID (optional)

**Returns:** number - Permission level (0-3)

**Example:**
```typescript
const level = permissionManager.getPermissionLevel('123456789', '987654321');
console.log(`User permission level: ${level}`);
```

### setPermissionLevel(userId: string, level: number, guildId?: string): void

Sets user's permission level.

**Parameters:**
- `userId` - User ID
- `level` - Permission level (0-3)
- `guildId` - Guild ID (optional)

**Example:**
```typescript
permissionManager.setPermissionLevel('123456789', PermissionManager.PERMISSION_LEVELS.ADMIN, '987654321');
```

## Permission System

### Wildcard Permissions

Users with the `*` permission have access to everything:

```typescript
// Owner gets wildcard permission automatically
permissions: ['*']
```

### Permission Levels

The system supports 4 permission levels:

- **USER (0)** - Basic user permissions
- **MODERATOR (1)** - Moderator permissions
- **ADMIN (2)** - Administrator permissions  
- **OWNER (3)** - Bot owner permissions

### Guild vs Global Permissions

Permissions can be set per guild or globally:

```typescript
// Guild-specific permissions
permissionManager.setUserPermissions('123456789', {
    userId: '123456789',
    guildId: '987654321',
    permissions: ['MANAGE_MESSAGES'],
    level: 1
});

// Global permissions
permissionManager.setUserPermissions('123456789', {
    userId: '123456789',
    permissions: ['ADMINISTRATOR'],
    level: 3
});
```

## Initialization

The permission manager automatically initializes with owner permissions:

```typescript
private initializeDefaultPermissions(): void {
    if (this.client.config.ownerId) {
        this.setUserPermissions(this.client.config.ownerId, {
            userId: this.client.config.ownerId,
            permissions: ['*'],
            level: PermissionManager.PERMISSION_LEVELS.OWNER
        });
    }
}
```

## Usage Examples

### Basic Permission Check

```typescript
// Check if user can manage messages
const canManage = await permissionManager.hasPermission(
    interaction.user.id,
    interaction.guildID,
    ['MANAGE_MESSAGES']
);

if (!canManage) {
    await interaction.createMessage({
        content: 'You need the MANAGE_MESSAGES permission to use this command.',
        flags: 64
    });
    return;
}
```

### Setting Up Moderator

```typescript
// Make user a moderator
permissionManager.setUserPermissions('123456789', {
    userId: '123456789',
    guildId: '987654321',
    permissions: ['MANAGE_MESSAGES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    level: PermissionManager.PERMISSION_LEVELS.MODERATOR
});
```

### Checking Permission Level

```typescript
// Check if user is admin or higher
const level = permissionManager.getPermissionLevel('123456789', '987654321');
if (level >= PermissionManager.PERMISSION_LEVELS.ADMIN) {
    // User is admin or owner
}
```

### Adding Single Permission

```typescript
// Add specific permission
permissionManager.addPermission('123456789', 'MANAGE_CHANNELS', '987654321');
```

## Integration with Commands

Commands can use the permission system via the `canExecute` method:

```typescript
// In BaseCommand.canExecute()
if (interaction.guildID && this.permissions.length > 0) {
    const hasPermission = await this.client.permissionManager.hasPermission(
        interaction.user.id,
        interaction.guildID,
        this.permissions
    );
    if (!hasPermission) {
        return false;
    }
}
```

## Best Practices

1. **Use descriptive permission names** - Make permission names clear and consistent
2. **Check permissions early** - Validate permissions before executing command logic
3. **Provide clear error messages** - Tell users what permissions they need
4. **Use permission levels** - Leverage the level system for hierarchical permissions
5. **Store permissions persistently** - Consider database storage for production
6. **Validate permission inputs** - Ensure permission names are valid
7. **Handle edge cases** - Account for missing users or invalid guilds
