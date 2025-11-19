import { CommandInteraction, Member } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, RequirePermissions, GuildOnly, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';
import { DatabaseService } from '@database/database.service';

@Command('warn', 'Warn a user and log it to the database')
@RequirePermissions('MODERATE_MEMBERS')
@GuildOnly()
@Cooldown(3000)
@injectable()
export class WarnCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    private database: DatabaseService
  ) {
    super(client);
    this.metadata.options = [
      {
        type: 6, // USER
        name: 'user',
        description: 'The user to warn',
        required: true,
      },
      {
        type: 3, // STRING
        name: 'reason',
        description: 'Reason for the warning',
        required: true,
        maxLength: 1024,
      },
    ];
    this.metadata.defaultMemberPermissions = 'MODERATE_MEMBERS';
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const targetUser = interaction.data.options.getUser('user', true);
    const reason = interaction.data.options.getString('reason', true);

    if (!interaction.guildID) {
      await interaction.createMessage({
        content: '❌ This command can only be used in a server.',
        flags: 64,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.createMessage({
        content: '❌ You cannot warn yourself!',
        flags: 64,
      });
      return;
    }

    if (targetUser.bot) {
      await interaction.createMessage({
        content: '❌ You cannot warn bots!',
        flags: 64,
      });
      return;
    }

    try {
      await this.database.getOrCreateGuild(interaction.guildID);
      await this.database.getOrCreateUser(targetUser.id);

      await this.database.createWarning({
        userId: targetUser.id,
        guildId: interaction.guildID,
        reason,
        moderator: interaction.user.id,
      });

      const warningCount = await this.database.getWarningCount(
        targetUser.id,
        interaction.guildID
      );

      const embed = EmbedBuilder.warning('User Warned')
        .setDescription(`**${targetUser.username}** has been warned`)
        .addField('User', `${targetUser.mention} (${targetUser.id})`, true)
        .addField('Moderator', `${interaction.user.mention}`, true)
        .addField('Reason', reason, false)
        .addField('Total Warnings', `${warningCount}`, true)
        .setThumbnail(targetUser.avatarURL())
        .setTimestamp()
        .build();

      await interaction.createMessage({ embeds: [embed] });

      try {
        const dmEmbed = EmbedBuilder.warning('You have been warned')
          .setDescription(`You have been warned in **${interaction.guild?.name || 'Unknown Server'}**`)
          .addField('Reason', reason, false)
          .addField('Moderator', interaction.user.username, true)
          .addField('Total Warnings', `${warningCount}`, true)
          .setTimestamp()
          .build();

        const dmChannel = await this.client.rest.users.createDM(targetUser.id);
        await this.client.rest.channels.createMessage(dmChannel.id, { embeds: [dmEmbed] });
      } catch (dmError) {
        this.client.logger.warn(`Could not DM user ${targetUser.id} about warning`);
      }

      this.client.logger.info(`User warned: ${targetUser.username} (${targetUser.id}) in guild ${interaction.guildID} by ${interaction.user.username} (${interaction.user.id})`);
    } catch (error) {
      this.client.logger.error('Failed to warn user', error);
      await interaction.createMessage({
        content: '❌ Failed to warn user. Please try again later.',
        flags: 64,
      });
    }
  }
}
