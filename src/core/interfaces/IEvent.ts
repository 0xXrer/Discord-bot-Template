import { ExtendedClient } from '../client/ExtendedClient';

export interface EventMetadata {
  name: string;
  once?: boolean;
}

export interface IEvent {
  metadata: EventMetadata;
  client: ExtendedClient;
  execute(...args: any[]): Promise<void> | void;
}
