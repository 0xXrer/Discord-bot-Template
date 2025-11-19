import { CommandInteraction, ButtonStyles } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder, ComponentBuilder } from '@common/builders';

@Command('help', 'Display all available commands and bot information')
@Cooldown(5000)
@injectable()
export class HelpCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    this.metadata.userInstallable = true;
    this.metadata.dmPermission = true;
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const commands = Array.from(this.client.commands.values());
    const commandList = commands
      .map((cmd) => `• \`/${cmd.metadata.name}\` - ${cmd.metadata.description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📚 Bot Commands')
      .setDescription('Here are all available commands:')
      .addField('Commands', commandList || 'No commands available', false)
      .setColor(0x0099ff)
      .setFooter(`Total Commands: ${commands.length}`)
      .setTimestamp()
      .build();

    const components = new ComponentBuilder()
      .addActionRow((row) =>
        row
          .addLinkButton(
            'Support Server',
            'https://discord.gg/your-server',
            '🆘'
          )
          .addLinkButton(
            'Invite Bot',
            `https://discord.com/api/oauth2/authorize?client_id=${this.client.config.get('clientId')}&permissions=0&scope=bot%20applications.commands`,
            '➕'
          )
      )
      .build();

    await interaction.createMessage({
      embeds: [embed],
      components,
    });
  }
}
