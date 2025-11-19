import { injectable } from 'tsyringe';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';
import { ExtendedClient } from '@core/client';

@Event('ready', true)
@injectable()
export class ReadyEvent extends BaseEvent {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public async execute(): Promise<void> {
    this.client.logger.info(`Logged in as ${this.client.user.username}#${this.client.user.discriminator}`);
    this.client.logger.info(`Bot is ready! Serving ${this.client.guilds.size} guilds`);

    try {
      await this.client.registerGlobalCommands();
      this.client.logger.info('Successfully registered global commands');
    } catch (error) {
      this.client.logger.error('Failed to register global commands', error);
    }

    this.updatePresence();
    setInterval(() => this.updatePresence(), 300000); // Update every 5 minutes
  }

  private updatePresence(): void {
    this.client.editStatus('online', [
      {
        type: 0, // PLAYING
        name: `with ${this.client.guilds.size} servers | /help`,
      },
    ]);
  }
}
