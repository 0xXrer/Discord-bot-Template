import { Collection } from 'oceanic.js';
import { BotClient } from '../client/BotClient';
import { BaseCommand } from '../commands/BaseCommand';
import { Logger } from '../utils/Logger';
import { FileUtils } from '../utils/FileUtils';
import path from 'path';

export class CommandHandler {
    private client: BotClient;
    private commands: Collection<string, BaseCommand>;
    private logger: Logger;

    constructor(client: BotClient) {
        this.client = client;
        this.commands = new Collection();
        this.logger = new Logger('CommandHandler');
    }

    public async loadCommands(): Promise<void> {
        try {
            const commandsPath = path.join(__dirname, '..', 'commands');

            const isDev = (process.env.NODE_ENV || 'development') === 'development';
            const exts = isDev ? ['.ts'] : ['.js'];

            const discoveredFiles: string[] = [];
            for (const ext of exts) {
                const files = await FileUtils.getFiles(commandsPath, ext);
                discoveredFiles.push(...files);
            }

            for (const file of discoveredFiles) {
                const baseName = path.basename(file).toLowerCase();
                if (baseName.startsWith('base')) {
                    this.logger.debug(`Skipping base file: ${file}`);
                    continue;
                }

                try {
                    const commandModule = await import(file);
                    const CommandClass = commandModule.default || commandModule;
                    
                    if (!CommandClass.prototype || !(CommandClass.prototype instanceof BaseCommand)) {
                        this.logger.debug(`Skipping ${file}: Not a valid command class`);
                        continue;
                    }

                    const command: BaseCommand = new CommandClass(this.client);
                    
                    if (!command.name) {
                        this.logger.warn(`Command in ${file} has no name property`);
                        continue;
                    }

                    // Track source file path for reloads
                    command.filePath = file;

                    this.commands.set(command.name, command);
                    this.logger.debug(`Loaded command: ${command.name}`);
                } catch (error) {
                    this.logger.error(`Failed to load command from ${file}:`, error);
                }
            }

            this.logger.info(`Loaded ${this.commands.size} commands`);
        } catch (error) {
            this.logger.error('Failed to load commands:', error);
            throw error;
        }
    }

    public getCommand(name: string): BaseCommand | undefined {
        return this.commands.get(name);
    }

    public getCommands(): BaseCommand[] {
        return Array.from(this.commands.values());
    }

    public hasCommand(name: string): boolean {
        return this.commands.has(name);
    }

    public async reloadCommand(name: string): Promise<boolean> {
        try {
            const command = this.commands.get(name);
            if (!command) return false;

            // Clear require cache
            const commandPath = command.filePath as unknown as string | undefined;
            if (commandPath && require.cache[commandPath]) {
                delete require.cache[commandPath];
            }

            // Remove old command
            this.commands.delete(name);

            // Reload command
            if (commandPath) {
                const CommandClass = (await import(commandPath)).default;
                const newCommand = new CommandClass(this.client);
                newCommand.filePath = commandPath;
                this.commands.set(name, newCommand);
                this.logger.info(`Reloaded command: ${name}`);
                return true;
            }

            return false;
        } catch (error) {
            this.logger.error(`Failed to reload command ${name}:`, error);
            return false;
        }
    }
}