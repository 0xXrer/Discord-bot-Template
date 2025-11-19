import 'reflect-metadata';
import { Client, ClientOptions, CommandInteraction } from 'oceanic.js';
import { singleton } from 'tsyringe';
import { Collection } from '@common/utils/Collection';
import { Logger } from '@common/logger';
import { Config } from '@config/Config';
import { ICommand, IEvent, IModule } from '../interfaces';
import { Container } from '../container';

@singleton()
export class ExtendedClient extends Client {
  public commands: Collection<string, ICommand>;
  public events: Collection<string, IEvent>;
  public modules: Collection<string, IModule>;
  public logger: Logger;
  public config: Config;

  constructor(logger: Logger, config: Config) {
    const options: ClientOptions = {
      auth: `Bot ${config.get('token')}`,
      gateway: {
        intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
      },
    };

    super(options);

    this.logger = logger;
    this.config = config;
    this.commands = new Collection();
    this.events = new Collection();
    this.modules = new Collection();

    Container.register('ExtendedClient', this);
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing bot...');

    try {
      await this.loadModules();
      await this.connect();
      this.logger.info('Bot successfully initialized and connected!');
    } catch (error) {
      this.logger.error('Failed to initialize bot', error);
      throw error;
    }
  }

  private async loadModules(): Promise<void> {
    this.logger.info('Loading modules...');
    // Modules will be loaded dynamically
  }

  public registerCommand(command: ICommand): void {
    this.commands.set(command.metadata.name, command);
    this.logger.debug(`Registered command: ${command.metadata.name}`);
  }

  public registerEvent(event: IEvent): void {
    this.events.set(event.metadata.name, event);

    const execute = async (...args: any[]) => {
      try {
        await event.execute(...args);
      } catch (error) {
        this.logger.error(`Error in event ${event.metadata.name}:`, error);
      }
    };

    if (event.metadata.once) {
      this.once(event.metadata.name as any, execute);
    } else {
      this.on(event.metadata.name as any, execute);
    }

    this.logger.debug(`Registered event: ${event.metadata.name}`);
  }

  public registerModule(module: IModule): void {
    this.modules.set(module.name, module);
    this.logger.debug(`Registered module: ${module.name}`);
  }

  public async registerGlobalCommands(): Promise<void> {
    try {
      const commandData = Array.from(this.commands.values()).map((cmd) => ({
        type: 1, // CHAT_INPUT
        name: cmd.metadata.name,
        description: cmd.metadata.description,
        options: cmd.metadata.options || [],
        defaultMemberPermissions: typeof cmd.metadata.defaultMemberPermissions === 'bigint'
          ? cmd.metadata.defaultMemberPermissions.toString()
          : (cmd.metadata.defaultMemberPermissions || null),
        dmPermission: cmd.metadata.dmPermission ?? true,
        nsfw: cmd.metadata.nsfw ?? false,
        contexts: cmd.metadata.contexts || [0, 1, 2],
        integrationTypes: cmd.metadata.integrationTypes || [0, 1],
      }));

      await this.application.bulkEditGlobalCommands(commandData);
      this.logger.info(`Registered ${commandData.length} global commands`);
    } catch (error) {
      this.logger.error('Failed to register global commands', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down bot...');

    for (const [name, module] of this.modules) {
      if (module.shutdown) {
        try {
          await module.shutdown();
          this.logger.debug(`Module ${name} shut down successfully`);
        } catch (error) {
          this.logger.error(`Error shutting down module ${name}:`, error);
        }
      }
    }

    this.disconnect(false);
    this.logger.info('Bot shut down successfully');
  }
}
