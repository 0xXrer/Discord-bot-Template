import { BotClient } from '../client/BotClient';
import { BaseEvent } from '../events/BaseEvent';
import { Logger } from '../utils/Logger';
import { FileUtils } from '../utils/FileUtils';
import path from 'path';
import type { ClientEvents } from 'oceanic.js';

export class EventHandler {
    private client: BotClient;
    private events: BaseEvent[];
    private logger: Logger;

    constructor(client: BotClient) {
        this.client = client;
        this.events = [];
        this.logger = new Logger('EventHandler');
    }

    public async loadEvents(): Promise<void> {
        try {
            const eventsPath = path.join(__dirname, '..', 'events');

            const isDev = (process.env.NODE_ENV || 'development') === 'development';
            const exts = isDev ? ['.ts'] : ['.js'];

            const discoveredFiles: string[] = [];
            for (const ext of exts) {
                const files = await FileUtils.getFiles(eventsPath, ext);
                discoveredFiles.push(...files);
            }

            for (const file of discoveredFiles) {
                const baseName = path.basename(file).toLowerCase();
                if (baseName.startsWith('base')) {
                    this.logger.debug(`Skipping base file: ${file}`);
                    continue;
                }

                try {
                    const eventModule = await import(file);
                    const EventClass = eventModule.default || eventModule;
                    
                    if (!EventClass.prototype || !(EventClass.prototype instanceof BaseEvent)) {
                        this.logger.debug(`Skipping ${file}: Not a valid event class`);
                        continue;
                    }

                    const event: BaseEvent = new EventClass(this.client);
                    
                    if (!event.name) {
                        this.logger.warn(`Event in ${file} has no name property`);
                        continue;
                    }

                    // Register event listener
                    const eventName = event.name as unknown as keyof ClientEvents;
                    if (event.once) {
                        this.client.once(eventName, (...args) => event.execute(...args));
                    } else {
                        this.client.on(eventName, (...args) => event.execute(...args));
                    }

                    this.events.push(event);
                    this.logger.debug(`Loaded event: ${event.name}`);
                } catch (error) {
                    this.logger.error(`Failed to load event from ${file}:`, error);
                }
            }

            this.logger.info(`Loaded ${this.events.length} events`);
        } catch (error) {
            this.logger.error('Failed to load events:', error);
            throw error;
        }
    }

    public getEvents(): BaseEvent[] {
        return this.events;
    }
}