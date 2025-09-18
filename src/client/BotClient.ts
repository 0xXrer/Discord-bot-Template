import { Client, ClientOptions, ApplicationCommandTypes } from 'oceanic.js';
import { CommandHandler } from '../handlers/CommandHandler';
import { EventHandler } from '../handlers/EventHandler';
import { PermissionManager } from '../managers/PermissionManager';
import { Logger } from '../utils/Logger';
import { Config } from '../config/Config';

export class BotClient extends Client {
    public commandHandler: CommandHandler;
    public eventHandler: EventHandler;
    public permissionManager: PermissionManager;
    public config: Config;
    public logger: Logger;

    constructor(options: ClientOptions) {
        super(options);
        
        this.logger = new Logger('BotClient');
        this.config = new Config();
        this.permissionManager = new PermissionManager(this);
        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);
    }

    public async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing bot client...');

            // Load handlers
            await this.eventHandler.loadEvents();
            await this.commandHandler.loadCommands();

            // Connect to Discord
            await this.connect();

            this.logger.info('Bot client initialized successfully!');
        } catch (error) {
            this.logger.error('Failed to initialize bot client:', error);
            throw error;
        }
    }

    public async shutdown(): Promise<void> {
        this.logger.info('Shutting down bot client...');
        
        try {
            this.disconnect(false);
            this.logger.info('Bot client shut down successfully');
        } catch (error) {
            this.logger.error('Error during shutdown:', error);
        }
    }

    public async registerGlobalCommands(): Promise<void> {
        try {
            const commands = this.commandHandler.getCommands();
            const commandData = commands.map(cmd => ({
                name: cmd.name,
                description: cmd.description,
                type: ApplicationCommandTypes.CHAT_INPUT as const,
                options: cmd.options || [],
                // Support for user-installable apps
                integrationTypes: [0, 1], // 0 = Guild, 1 = User  
                contexts: [0, 1, 2] // 0 = Guild, 1 = BotDM, 2 = PrivateChannel
            }));

            await this.application.bulkEditGlobalCommands(commandData as any);
            this.logger.info(`Registered ${commandData.length} global commands`);
        } catch (error) {
            this.logger.error('Failed to register global commands:', error);
            throw error;
        }
    }
}