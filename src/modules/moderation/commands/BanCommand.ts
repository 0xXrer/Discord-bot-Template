import { CommandInteraction, Member, User as OceanicUser } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, RequirePermissions, GuildOnly, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder, ModalBuilder } from '@common/builders';
import { DatabaseService } from '@database/database.service';

@Command('ban', 'Ban a user from the server')
@RequirePermissions('BAN_MEMBERS')
@GuildOnly()
@Cooldown(3000)
@injectable()
export class BanCommand extends BaseCommand {
  constructor(
    client: ExtendedClient,
    private database: DatabaseService
  ) {
    super(client);
    this.metadata.options = [
      {
        type: 6, // USER
        name: 'user',
        description: 'The user to ban',
        required: true,
      },
      {
        type: 3, // STRING
        name: 'reason',
        description: 'Reason for the ban',
        required: false,
        maxLength: 512,
      },
      {
        type: 4, // INTEGER
        name: 'delete_days',
        description: 'Number of days of messages to delete (0-7)',
        required: false,
        minValue: 0,
        maxValue: 7,
      },
    ];
    this.metadata.defaultMemberPermissions = 'BAN_MEMBERS';
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const targetUser = interaction.data.options.getUser('user', true);
    const reason = interaction.data.options.getString('reason', false) || 'No reason provided';
    const deleteDays = interaction.data.options.getInteger('delete_days', false) || 0;

    if (!interaction.guildID) {
      await interaction.createMessage({
        content: '❌ This command can only be used in a server.',
        flags: 64,
      });
      return;
    }

    const guild = this.client.guilds.get(interaction.guildID);
    if (!guild) {
      await interaction.createMessage({
        content: '❌ Could not find guild.',
        flags: 64,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.createMessage({
        content: '❌ You cannot ban yourself!',
        flags: 64,
      });
      return;
    }

    if (targetUser.id === this.client.user.id) {
      await interaction.createMessage({
        content: '❌ I cannot ban myself!',
        flags: 64,
      });
      return;
    }

    const targetMember = guild.members.get(targetUser.id);
    if (targetMember) {
      const executorMember = interaction.member as Member;
      if (!this.canModerate(executorMember, targetMember)) {
        await interaction.createMessage({
          content: '❌ You cannot ban this user (higher or equal role hierarchy).',
          flags: 64,
        });
        return;
      }
    }

    try {
      await guild.createBan(targetUser.id, {
        deleteMessageSeconds: deleteDays * 86400,
        reason: `${reason} | Banned by ${interaction.user.username}`,
      });

      const embed = EmbedBuilder.success('User Banned')
        .setDescription(`Successfully banned **${targetUser.username}**`)
        .addField('User', `${targetUser.mention} (${targetUser.id})`, true)
        .addField('Moderator', `${interaction.user.mention}`, true)
        .addField('Reason', reason, false)
        .addField('Message History', `${deleteDays} days deleted`, true)
        .setTimestamp()
        .build();

      await interaction.createMessage({ embeds: [embed] });

      this.client.logger.info(`User banned: ${targetUser.username} (${targetUser.id}) in guild ${guild.name} (${guild.id}) by ${interaction.user.username} (${interaction.user.id})`);
    } catch (error) {
      this.client.logger.error('Failed to ban user', error);
      await interaction.createMessage({
        content: '❌ Failed to ban user. Make sure I have the required permissions.',
        flags: 64,
      });
    }
  }

  private canModerate(executor: Member, target: Member): boolean {
    const executorHighestRole = executor.roles
      .map((roleId) => executor.guild.roles.get(roleId))
      .filter((role) => role !== undefined)
      .sort((a, b) => (b?.position || 0) - (a?.position || 0))[0];

    const targetHighestRole = target.roles
      .map((roleId) => target.guild.roles.get(roleId))
      .filter((role) => role !== undefined)
      .sort((a, b) => (b?.position || 0) - (a?.position || 0))[0];

    return (executorHighestRole?.position || 0) > (targetHighestRole?.position || 0);
  }
}
