import { injectable } from 'tsyringe';
import { BaseEvent } from '@core/base';
import { Event } from '@core/decorators';
import { ExtendedClient } from '@core/client';

@Event('error', false)
@injectable()
export class ErrorEvent extends BaseEvent {
  constructor(client: ExtendedClient) {
    super(client);
  }

  public execute(error: Error, shardID: number): void {
    this.client.logger.error(`Error on shard ${shardID}:`, error);
  }
}
