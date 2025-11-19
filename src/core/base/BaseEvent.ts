import { IEvent, EventMetadata } from '../interfaces/IEvent';
import { ExtendedClient } from '../client/ExtendedClient';
import { getEventMetadata } from '../decorators';

export abstract class BaseEvent implements IEvent {
  public metadata: EventMetadata;
  public client: ExtendedClient;

  constructor(client: ExtendedClient) {
    this.client = client;

    const eventMetadata = getEventMetadata(this.constructor);
    if (!eventMetadata) {
      throw new Error(`Event ${this.constructor.name} is missing @Event decorator`);
    }

    this.metadata = eventMetadata;
  }

  public abstract execute(...args: any[]): Promise<void> | void;
}
