import { BaseEvent } from './BaseEvent';
import { BotClient } from '../client/BotClient';

export default class Ready extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'ready',
            once: true
        });
    }

    public async execute(): Promise<void> {
        this.client.logger.info(`Ready as ${this.client.user?.tag}`);
        this.client.logger.info(`Serving ${this.client.guilds.size} guilds`);
        
        // Register global commands
        try {
            await this.client.registerGlobalCommands();
        } catch (error) {
            this.client.logger.error('Failed to register commands on ready:', error);
        }

        // Set bot status
        this.client.editStatus('online', [
            {
                type: 0, // Playing
                name: 'Серега ПИДОРАС!'
            }
        ]);
    }
}