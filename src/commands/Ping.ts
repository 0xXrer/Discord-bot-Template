import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction } from 'oceanic.js';

export default class Ping extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'ping',
            description: 'Check the bot\'s latency',
            userInstallable: true,
            cooldown: 5000
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const start = Date.now();
        
        await interaction.defer();
        
        const end = Date.now();
        const ping = end - start;
        const wsPing = this.client.shards.get(0)?.latency || 0;

        await interaction.editOriginal({
            content: `🏓 **Pong!**\n` +
                    `📡 API Latency: \`${ping}ms\`\n` +
                    `💓 WebSocket: \`${wsPing}ms\`\n` +
                    `${interaction.guildID ? '🏠 Guild Command' : '📱 User App / DM'}`
        });
    }
}