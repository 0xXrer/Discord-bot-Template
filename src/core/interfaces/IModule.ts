import { ExtendedClient } from '../client/ExtendedClient';

export interface IModule {
  name: string;
  initialize(client: ExtendedClient): Promise<void>;
  shutdown?(): Promise<void>;
}
