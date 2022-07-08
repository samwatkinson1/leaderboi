import { Command } from '../types/command'
import { SlashCommandBuilder } from '@discordjs/builders'

const handler: Command['handler'] = async interaction => {
    console.log('leaderboard', interaction.type)
    await interaction.reply('hello')
}

const builder = new SlashCommandBuilder().addStringOption(option =>
    option.setName('emoji').setDescription('emoji').setRequired(true)
)

export default {
    name: 'leaderboard',
    description: 'leaderboard',
    builder,
    handler
} as Command
