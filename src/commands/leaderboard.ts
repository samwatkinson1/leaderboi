import { Command } from '../types/command'

const handler: Command['handler'] = async interaction => {
    console.log('leaderboard', interaction.type)
    await interaction.reply('hello')
}

export default {
    name: 'leaderboard',
    description: 'leaderboard',
    handler
} as Command
