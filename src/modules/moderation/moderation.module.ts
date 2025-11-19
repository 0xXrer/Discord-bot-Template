import { injectable } from 'tsyringe';
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';
import { Container } from '@core/container';

import { BanCommand } from './commands/BanCommand';
import { KickCommand } from './commands/KickCommand';
import { WarnCommand } from './commands/WarnCommand';

@injectable()
export class ModerationModule extends BaseModule {
  public name = 'Moderation';

  constructor(client: ExtendedClient) {
    super(client);
  }

  public async initialize(client: ExtendedClient): Promise<void> {
    client.logger.info(`Initializing ${this.name} module...`);

    const commands = [
      Container.get<BanCommand>(BanCommand),
      Container.get<KickCommand>(KickCommand),
      Container.get<WarnCommand>(WarnCommand),
    ];

    commands.forEach((command) => client.registerCommand(command));

    client.logger.info(`${this.name} module initialized with ${commands.length} commands`);
  }
}
