import { BotClient } from '../client/BotClient';
import { Logger } from '../utils/Logger';

export interface UserPermissions {
    userId: string;
    guildId?: string;
    permissions: string[];
    level: number;
}

export class PermissionManager {
    private client: BotClient;
    private logger: Logger;
    private userPermissions: Map<string, UserPermissions>;

    public static readonly PERMISSION_LEVELS = {
        USER: 0,
        MODERATOR: 1,
        ADMIN: 2,
        OWNER: 3
    };

    constructor(client: BotClient) {
        this.client = client;
        this.logger = new Logger('PermissionManager');
        this.userPermissions = new Map();
        
        // Initialize default permissions
        this.initializeDefaultPermissions();
    }

    private initializeDefaultPermissions(): void {
        // Set owner permissions
        if (this.client.config.ownerId) {
            this.setUserPermissions(this.client.config.ownerId, {
                userId: this.client.config.ownerId,
                permissions: ['*'],
                level: PermissionManager.PERMISSION_LEVELS.OWNER
            });
        }
    }

    public async hasPermission(
        userId: string, 
        guildId?: string, 
        requiredPermissions: string[] = []
    ): Promise<boolean> {
        try {
            // Get user permissions
            const userPerms = this.getUserPermissions(userId, guildId);
            
            // Owner has all permissions
            if (userPerms && userPerms.permissions.includes('*')) {
                return true;
            }

            // Check if user has required permissions
            if (requiredPermissions.length === 0) {
                return true;
            }

            return requiredPermissions.every(permission => 
                userPerms?.permissions.includes(permission)
            );
        } catch (error) {
            this.logger.error('Error checking permissions:', error);
            return false;
        }
    }

    public getUserPermissions(userId: string, guildId?: string): UserPermissions | undefined {
        const key = guildId ? `${userId}:${guildId}` : userId;
        return this.userPermissions.get(key) || this.userPermissions.get(userId);
    }

    public setUserPermissions(userId: string, permissions: UserPermissions): void {
        const key = permissions.guildId ? `${userId}:${permissions.guildId}` : userId;
        this.userPermissions.set(key, permissions);
        this.logger.debug(`Set permissions for ${userId}: ${permissions.permissions.join(', ')}`);
    }

    public removeUserPermissions(userId: string, guildId?: string): boolean {
        const key = guildId ? `${userId}:${guildId}` : userId;
        return this.userPermissions.delete(key);
    }

    public addPermission(userId: string, permission: string, guildId?: string): void {
        const userPerms = this.getUserPermissions(userId, guildId);
        if (userPerms) {
            if (!userPerms.permissions.includes(permission)) {
                userPerms.permissions.push(permission);
                this.setUserPermissions(userId, userPerms);
            }
        } else {
            this.setUserPermissions(userId, {
                userId,
                guildId,
                permissions: [permission],
                level: PermissionManager.PERMISSION_LEVELS.USER
            });
        }
    }

    public removePermission(userId: string, permission: string, guildId?: string): void {
        const userPerms = this.getUserPermissions(userId, guildId);
        if (userPerms) {
            userPerms.permissions = userPerms.permissions.filter(p => p !== permission);
            this.setUserPermissions(userId, userPerms);
        }
    }

    public getPermissionLevel(userId: string, guildId?: string): number {
        const userPerms = this.getUserPermissions(userId, guildId);
        return userPerms?.level ?? PermissionManager.PERMISSION_LEVELS.USER;
    }

    public setPermissionLevel(userId: string, level: number, guildId?: string): void {
        const userPerms = this.getUserPermissions(userId, guildId) || {
            userId,
            guildId,
            permissions: [],
            level: PermissionManager.PERMISSION_LEVELS.USER
        };
        
        userPerms.level = level;
        this.setUserPermissions(userId, userPerms);
    }
}