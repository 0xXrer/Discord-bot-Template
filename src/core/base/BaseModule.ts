import { IModule } from '../interfaces/IModule';
import { ExtendedClient } from '../client/ExtendedClient';

export abstract class BaseModule implements IModule {
  public abstract name: string;
  protected client: ExtendedClient;

  constructor(client: ExtendedClient) {
    this.client = client;
  }

  public abstract initialize(client: ExtendedClient): Promise<void>;

  public async shutdown?(): Promise<void> {
    // Optional shutdown logic
  }
}
