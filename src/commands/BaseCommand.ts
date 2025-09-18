import { CommandInteraction, ApplicationCommandOptions } from 'oceanic.js';
import { BotClient } from '../client/BotClient';

export interface CommandOptions {
    name: string;
    description: string;
    options?: ApplicationCommandOptions[];
    permissions?: string[];
    userInstallable?: boolean;
    guildOnly?: boolean;
    dmOnly?: boolean;
    ownerOnly?: boolean;
    cooldown?: number;
}

export abstract class BaseCommand {
    public client: BotClient;
    public name: string;
    public description: string;
    public options?: ApplicationCommandOptions[];
    public permissions: string[];
    public userInstallable: boolean;
    public guildOnly: boolean;
    public dmOnly: boolean;
    public ownerOnly: boolean;
    public cooldown: number;
    public filePath?: string;

    constructor(client: BotClient, options: CommandOptions) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.options = options.options;
        this.permissions = options.permissions || [];
        this.userInstallable = options.userInstallable ?? true;
        this.guildOnly = options.guildOnly ?? false;
        this.dmOnly = options.dmOnly ?? false;
        this.ownerOnly = options.ownerOnly ?? false;
        this.cooldown = options.cooldown ?? 3000; // 3 seconds default
    }

    public abstract execute(interaction: CommandInteraction): Promise<void>;

    public async canExecute(interaction: CommandInteraction): Promise<boolean> {
        // Check if command is owner only
        if (this.ownerOnly && interaction.user.id !== this.client.config.ownerId) {
            return false;
        }

        // Check if command is guild only but executed in DM
        if (this.guildOnly && !interaction.guildID) {
            return false;
        }

        // Check if command is DM only but executed in guild
        if (this.dmOnly && interaction.guildID) {
            return false;
        }

        // Check user permissions if in guild
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

        return true;
    }
}