import { BaseEvent } from './BaseEvent';
import { BotClient } from '../client/BotClient';

export default class Error extends BaseEvent {
    constructor(client: BotClient) {
        super(client, {
            name: 'error'
        });
    }

    public execute(error: Error): void {
        this.client.logger.error('Client error:', error);
    }
}