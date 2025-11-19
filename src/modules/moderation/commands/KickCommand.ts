import { CommandInteraction, Member } from 'oceanic.js';
import { injectable } from 'tsyringe';
import { BaseCommand } from '@core/base';
import { Command, RequirePermissions, GuildOnly, Cooldown } from '@core/decorators';
import { ExtendedClient } from '@core/client';
import { EmbedBuilder } from '@common/builders';

@Command('kick', 'Kick a user from the server')
@RequirePermissions('KICK_MEMBERS')
@GuildOnly()
@Cooldown(3000)
@injectable()
export class KickCommand extends BaseCommand {
  constructor(client: ExtendedClient) {
    super(client);
    this.metadata.options = [
      {
        type: 6, // USER
        name: 'user',
        description: 'The user to kick',
        required: true,
      },
      {
        type: 3, // STRING
        name: 'reason',
        description: 'Reason for the kick',
        required: false,
        maxLength: 512,
      },
    ];
    this.metadata.defaultMemberPermissions = 'KICK_MEMBERS';
  }

  public async execute(interaction: CommandInteraction): Promise<void> {
    const targetUser = interaction.data.options.getUser('user', true);
    const reason = interaction.data.options.getString('reason', false) || 'No reason provided';

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

    const targetMember = guild.members.get(targetUser.id);
    if (!targetMember) {
      await interaction.createMessage({
        content: '❌ User is not a member of this server.',
        flags: 64,
      });
      return;
    }

    if (targetUser.id === interaction.user.id) {
      await interaction.createMessage({
        content: '❌ You cannot kick yourself!',
        flags: 64,
      });
      return;
    }

    if (targetUser.id === this.client.user.id) {
      await interaction.createMessage({
        content: '❌ I cannot kick myself!',
        flags: 64,
      });
      return;
    }

    const executorMember = interaction.member as Member;
    if (!this.canModerate(executorMember, targetMember)) {
      await interaction.createMessage({
        content: '❌ You cannot kick this user (higher or equal role hierarchy).',
        flags: 64,
      });
      return;
    }

    try {
      await guild.removeMember(targetUser.id, `${reason} | Kicked by ${interaction.user.username}`);

      const embed = EmbedBuilder.success('User Kicked')
        .setDescription(`Successfully kicked **${targetUser.username}**`)
        .addField('User', `${targetUser.mention} (${targetUser.id})`, true)
        .addField('Moderator', `${interaction.user.mention}`, true)
        .addField('Reason', reason, false)
        .setTimestamp()
        .build();

      await interaction.createMessage({ embeds: [embed] });

      this.client.logger.info(`User kicked: ${targetUser.username} (${targetUser.id}) in guild ${guild.name} (${guild.id}) by ${interaction.user.username} (${interaction.user.id})`);
    } catch (error) {
      this.client.logger.error('Failed to kick user', error);
      await interaction.createMessage({
        content: '❌ Failed to kick user. Make sure I have the required permissions.',
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
