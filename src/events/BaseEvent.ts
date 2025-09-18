import { BotClient } from '../client/BotClient';

export interface EventOptions {
    name: string;
    once?: boolean;
}

export abstract class BaseEvent {
    public client: BotClient;
    public name: string;
    public once: boolean;

    constructor(client: BotClient, options: EventOptions) {
        this.client = client;
        this.name = options.name;
        this.once = options.once ?? false;
    }

    public abstract execute(...args: any[]): Promise<void> | void;
}