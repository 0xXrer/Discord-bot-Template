import { injectable } from 'tsyringe';
import { BaseModule } from '@core/base';
import { ExtendedClient } from '@core/client';
import { Container } from '@core/container';

import { PingCommand } from './commands/PingCommand';
import { HelpCommand } from './commands/HelpCommand';
import { InfoCommand } from './commands/InfoCommand';

import { ReadyEvent } from './events/ReadyEvent';
import { InteractionCreateEvent } from './events/InteractionCreateEvent';
import { ErrorEvent } from './events/ErrorEvent';

@injectable()
export class GeneralModule extends BaseModule {
  public name = 'General';

  constructor(client: ExtendedClient) {
    super(client);
  }

  public async initialize(client: ExtendedClient): Promise<void> {
    client.logger.info(`Initializing ${this.name} module...`);

    const commands = [
      Container.get<PingCommand>(PingCommand),
      Container.get<HelpCommand>(HelpCommand),
      Container.get<InfoCommand>(InfoCommand),
    ];

    const events = [
      Container.get<ReadyEvent>(ReadyEvent),
      Container.get<InteractionCreateEvent>(InteractionCreateEvent),
      Container.get<ErrorEvent>(ErrorEvent),
    ];

    commands.forEach((command) => client.registerCommand(command));
    events.forEach((event) => client.registerEvent(event));

    client.logger.info(`${this.name} module initialized with ${commands.length} commands and ${events.length} events`);
  }
}
