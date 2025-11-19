import { CommandInteraction } from 'oceanic.js';
import { ICommand, CommandMetadata } from '../interfaces/ICommand';
import { ExtendedClient } from '../client/ExtendedClient';
import {
  getCommandMetadata,
  getGuardsMetadata,
  getCooldownMetadata,
  GuardOptions,
} from '../decorators';

export abstract class BaseCommand implements ICommand {
  public metadata: CommandMetadata;
  public client: ExtendedClient;
  public cooldowns: Map<string, number>;
  public permissions?: string[];
  private guards?: GuardOptions;
  private cooldownMs?: number;

  constructor(client: ExtendedClient) {
    this.client = client;
    this.cooldowns = new Map();

    const commandMetadata = getCommandMetadata(this.constructor);
    if (!commandMetadata) {
      throw new Error(`Command ${this.constructor.name} is missing @Command decorator`);
    }

    this.metadata = commandMetadata as CommandMetadata;
    this.guards = getGuardsMetadata(this.constructor);
    this.cooldownMs = getCooldownMetadata(this.constructor);

    if (this.guards) {
      this.permissions = this.guards.permissions;
      this.metadata.guildOnly = this.guards.guildOnly ?? this.metadata.guildOnly;
      this.metadata.ownerOnly = this.guards.ownerOnly ?? this.metadata.ownerOnly;
      this.metadata.nsfw = this.guards.nsfw ?? this.metadata.nsfw;
    }
  }

  public abstract execute(interaction: CommandInteraction): Promise<void>;

  public async canExecute(interaction: CommandInteraction): Promise<boolean> {
    if (this.guards?.ownerOnly && interaction.user.id !== this.client.config.get('ownerId')) {
      await interaction.createMessage({
        content: 'This command is only available to the bot owner.',
        flags: 64,
      });
      return false;
    }

    if (this.guards?.guildOnly && !interaction.guildID) {
      await interaction.createMessage({
        content: 'This command can only be used in a server.',
        flags: 64,
      });
      return false;
    }

    if (this.guards?.dmOnly && interaction.guildID) {
      await interaction.createMessage({
        content: 'This command can only be used in DMs.',
        flags: 64,
      });
      return false;
    }

    if (this.cooldownMs) {
      const now = Date.now();
      const cooldownEnd = this.cooldowns.get(interaction.user.id);

      if (cooldownEnd && now < cooldownEnd) {
        const timeLeft = Math.ceil((cooldownEnd - now) / 1000);
        await interaction.createMessage({
          content: `Please wait ${timeLeft} seconds before using this command again.`,
          flags: 64,
        });
        return false;
      }

      this.cooldowns.set(interaction.user.id, now + this.cooldownMs);
      setTimeout(() => this.cooldowns.delete(interaction.user.id), this.cooldownMs);
    }

    return true;
  }
}
