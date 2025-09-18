import { BaseEvent } from './BaseEvent';
import { BotClient } from '../client/BotClient';
import { CommandInteraction, InteractionTypes } from 'oceanic.js';

export default class InteractionCreate extends BaseEvent {
    constructor(client: BotClient) {
        super(client, { name: 'interactionCreate' });
    }

    public async execute(interaction: unknown): Promise<void> {
        // Only handle application command interactions
        const i = interaction as CommandInteraction;
        if (!i || typeof i.type !== 'number' || i.type !== InteractionTypes.APPLICATION_COMMAND) {
            return;
        }

        const commandName = i.data?.name;
        if (!commandName) {
            return;
        }

        const command = this.client.commandHandler.getCommand(commandName);
        if (!command) {
            await i.createMessage?.({ content: 'Unknown command.', flags: 64 }).catch(() => undefined);
            return;
        }

        // Permission and context checks
        const allowed = await command.canExecute(i);
        if (!allowed) {
            await i.createMessage({ content: 'You do not have permission to use this command.', flags: 64 }).catch(() => undefined);
            return;
        }

        try {
            await command.execute(i);
        } catch (error) {
            this.client.logger.error(`Error executing command ${command.name}:`, error);
            try {
                if (i.acknowledged) {
                    await i.editOriginal?.({ content: 'There was an error executing this command.' });
                } else {
                    await i.createMessage?.({ content: 'There was an error executing this command.', flags: 64 });
                }
            } catch {
                // ignore follow-up error
            }
        }
    }
}
