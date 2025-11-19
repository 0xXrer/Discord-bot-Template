import { CommandInteraction, ApplicationCommandOptions } from 'oceanic.js';
import { ExtendedClient } from '../client/ExtendedClient';

export interface CommandMetadata {
  name: string;
  description: string;
  options?: ApplicationCommandOptions[];
  defaultMemberPermissions?: bigint | string | null;
  dmPermission?: boolean;
  nsfw?: boolean;
  guildOnly?: boolean;
  ownerOnly?: boolean;
  userInstallable?: boolean;
  contexts?: number[];
  integrationTypes?: number[];
}

export interface ICommand {
  metadata: CommandMetadata;
  client: ExtendedClient;
  cooldowns?: Map<string, number>;
  permissions?: string[];
  execute(interaction: CommandInteraction): Promise<void>;
  canExecute(interaction: CommandInteraction): Promise<boolean>;
}
