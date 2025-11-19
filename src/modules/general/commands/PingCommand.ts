import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('ping', 'Check the bot latency and response time')
@Cooldown(3000)
@injectable()
export class PingCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = true;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const sent = await interaction.createMessage({
      content: '🏓 Pinging...',
    });

    const latency = Date.now() - interaction.createdAt.getTime();
    const apiLatency = this.client.shards.get(0)?.latency ?? 0;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x00ff00)
      .addField('Bot Latency', `${latency}ms`, true)
      .addField('API Latency', `${Math.round(apiLatency)}ms`, true)
      .addField('Status', this.getStatusEmoji(latency), true)
      .setTimestamp()
      .build();

    await interaction.editOriginal({
      content: '',
      embeds: [embed],
    });
  }

  private getStatusEmoji(latency: number): string {
    if (latency < 100) return '🟢 Excellent';
    if (latency < 200) return '🟡 Good';
    if (latency < 500) return '🟠 Fair';
    return '🔴 Poor';
  }
}
