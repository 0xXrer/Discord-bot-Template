import { CommandInteraction } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('info', 'Display bot information and statistics')
@Cooldown(5000)
@injectable()
export class InfoCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = true;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const uptime = this.formatUptime(process.uptime());
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const guildCount = this.client.guilds.size;
    const userCount = this.client.users.size;
    const commandCount = this.client.commands.size;

    const embed = new EmbedBuilder()
      .setTitle('ℹ️ Bot Information')
      .setDescription('Modern Discord bot built with Oceanic.js and TypeScript')
      .addField('📊 Statistics', [
        `**Guilds:** ${guildCount}`,
        `**Users:** ${userCount}`,
        `**Commands:** ${commandCount}`,
      ].join('\n'), true)
      .addField('⚙️ System', [
        `**Uptime:** ${uptime}`,
        `**Memory:** ${memoryUsage} MB`,
        `**Node.js:** ${process.version}`,
      ].join('\n'), true)
      .addField('🔧 Technical', [
        `**Oceanic.js:** v1.10.2`,
        `**TypeScript:** v5.3.3`,
        `**Shards:** ${this.client.shards.size}`,
      ].join('\n'), true)
      .setColor(0x5865f2)
      .setThumbnail(this.client.user.avatarURL())
      .setFooter(`Requested by ${interaction.user.username}`, interaction.user.avatarURL())
      .setTimestamp()
      .build();

    await interaction.createMessage({
      embeds: [embed],
    });
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
