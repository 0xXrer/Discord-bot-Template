import { BaseCommand } from './BaseCommand';
import { BotClient } from '../client/BotClient';
import { CommandInteraction, ApplicationCommandOptionTypes } from 'oceanic.js';

export default class Help extends BaseCommand {
    constructor(client: BotClient) {
        super(client, {
            name: 'help',
            description: 'Get help with bot commands',
            userInstallable: true,
            options: [
                {
                    name: 'command',
                    description: 'Get help for a specific command',
                    type: ApplicationCommandOptionTypes.STRING,
                    required: false
                }
            ]
        });
    }

    public async execute(interaction: CommandInteraction): Promise<void> {
        const commandName = interaction.data.options?.getString('command');

        if (commandName) {
            // Show help for specific command
            const command = this.client.commandHandler.getCommand(commandName);
            
            if (!command) {
                await interaction.createMessage({
                    content: `❌ Command \`${commandName}\` not found.`,
                    flags: 64
                });
                return;
            }

            const embed = {
                title: `📖 Help: ${command.name}`,
                description: command.description,
                fields: [
                    {
                        name: '🔧 Usage',
                        value: `\`/${command.name}\``,
                        inline: true
                    },
                    {
                        name: '⏱️ Cooldown',
                        value: `${command.cooldown / 1000}s`,
                        inline: true
                    },
                    {
                        name: '📱 User Installable',
                        value: command.userInstallable ? 'Yes' : 'No',
                        inline: true
                    }
                ],
                color: 0x5865F2,
                footer: {
                    text: 'Use /help to see all commands'
                }
            };

            if (command.options && command.options.length > 0) {
                const optionsText = command.options.map(opt => 
                    `\`${opt.name}\` - ${opt.description} ${opt.required ? '(required)' : '(optional)'}`
                ).join('\n');
                
                embed.fields.push({
                    name: '⚙️ Options',
                    value: optionsText,
                    inline: false
                });
            }

            await interaction.createMessage({ embeds: [embed] });
        } else {
            // Show all commands
            const commands = this.client.commandHandler.getCommands();
            const commandList = commands.map(cmd => 
                `\`/${cmd.name}\` - ${cmd.description} ${cmd.userInstallable ? '📱' : ''}`
            ).join('\n');

            const embed = {
                title: '📚 Bot Commands',
                description: 'Here are all available commands:\n\n' + commandList,
                fields: [
                    {
                        name: '💡 Tips',
                        value: '• 📱 = Can be used as user app in DMs\n' +
                               '• Use `/help <command>` for detailed info\n' +
                               '• Commands work in servers and DMs!',
                        inline: false
                    }
                ],
                color: 0x5865F2,
                footer: {
                    text: `${commands.length} commands available`
                }
            };

            await interaction.createMessage({ embeds: [embed] });
        }
    }
}