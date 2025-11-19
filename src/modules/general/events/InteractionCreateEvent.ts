import { CommandInteraction, ComponentInteraction, Interaction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { DatabaseService } from '@database/database.service';

@Event('interactionCreate', false)
@injectable()
export class InteractionCreateEvent extends BaseEvent {
  constructor(
    client: ExtendedClient,
    private database: DatabaseService
  ) {
    super(client);
  }

  public async execute(interaction: Interaction): Promise<void> {
    if (interaction instanceof CommandInteraction) {
      await this.handleCommand(interaction);
    }
  }

  private async handleCommand(interaction: CommandInteraction): Promise<void> {
    const command = this.client.commands.get(interaction.data.name);

    if (!command) {
      await interaction.createMessage({
        content: '❌ Command not found.',
        flags: 64,
      });
      return;
    }

    try {
      const canExecute = await command.canExecute(interaction);
      if (!canExecute) {
        return;
      }

      await command.execute(interaction);

      if (this.client.config.get('databaseUrl')) {
        await this.database.logCommandUsage({
          commandName: interaction.data.name,
          userId: interaction.user.id,
          guildId: interaction.guildID || undefined,
        }).catch((error) => {
          this.client.logger.warn('Failed to log command usage', error);
        });
      }

      this.client.logger.info(`Command executed: ${interaction.data.name} by ${interaction.user.username} (${interaction.user.id})`);
    } catch (error) {
      this.client.logger.error(`Error executing command ${interaction.data.name}:`, error);

      const errorMessage = {
        content: '❌ An error occurred while executing this command.',
        flags: 64,
      };

      if (interaction.acknowledged) {
        await interaction.editOriginal(errorMessage).catch(() => {});
      } else {
        await interaction.createMessage(errorMessage).catch(() => {});
      }
    }
  }
}
