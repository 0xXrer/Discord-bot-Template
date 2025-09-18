import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';

export default class UserInfo extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'userinfo',
            description: 'Get information about a user',
            userInstallable: true,
            options: [
                {
                    name: 'user',
                    description: 'The user to get information about',
                    type: ApplicationCommandOptionTypes.USER,
                    required: false
                }
            ]
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const targetUser = interaction.data.options?.getUser('user') || interaction.user;
        const member = interaction.guildID ? 
            await this.client.rest.guilds.getMember(interaction.guildID, targetUser.id).catch(() => null) : null;

        const accountCreated = Math.floor(new Date(targetUser.createdAt).getTime() / 1000);
        
        const embed: any = {
            title: `👤 User Information`,
            thumbnail: {
                url: targetUser.avatarURL()
            },
            fields: [
                {
                    name: '🏷️ Tag',
                    value: targetUser.tag,
                    inline: true
                },
                {
                    name: '🆔 ID',
                    value: targetUser.id,
                    inline: true
                },
                {
                    name: '📅 Account Created',
                    value: `<t:${accountCreated}:F>\n(<t:${accountCreated}:R>)`,
                    inline: false
                }
            ],
            color: targetUser.accentColor || 0x5865F2,
            footer: {
                text: `Requested by ${interaction.user.tag}`,
                icon_url: interaction.user.avatarURL()
            },
            timestamp: new Date().toISOString()
        };

        // Add guild-specific information if available
        if (member && interaction.guildID) {
            const joinedAt = member.joinedAt ? Math.floor(new Date(member.joinedAt).getTime() / 1000) : null;
            
            if (joinedAt) {
                embed.fields.push({
                    name: '📥 Joined Server',
                    value: `<t:${joinedAt}:F>\n(<t:${joinedAt}:R>)`,
                    inline: false
                });
            }

            if (member.roles && member.roles.length > 0) {
                const roles = member.roles.slice(0, 10).map(roleId => `<@&${roleId}>`).join(' ');
                embed.fields.push({
                    name: `🎭 Roles [${member.roles.length}]`,
                    value: roles + (member.roles.length > 10 ? '...' : ''),
                    inline: false
                });
            }
        } else if (!interaction.guildID) {
            embed.fields.push({
                name: '📍 Context',
                value: 'This command was used in DMs or as a user app',
                inline: false
            });
        }

        await interaction.createMessage({ embeds: [embed] });
    }
}