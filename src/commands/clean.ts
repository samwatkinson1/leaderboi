import { Command } from '../types/command'
import { SlashCommandBuilder } from '@discordjs/builders'
import { fetchChannel } from '../utils/interaction'
import { TextChannel } from 'discord.js'

const handler: Command['handler'] = async interaction => {
    await interaction.deferReply({ ephemeral: true })

    const param = interaction.options.getNumber('count', true)

    const channel = await fetchChannel(interaction)
    if (!channel || !channel?.isText()) {
        return interaction.reply('/clean can only be used in a text chat!')
    }

    const textChannel = channel as TextChannel
    const messages = textChannel.messages.cache
    if (!messages.size) {
        return interaction.editReply('No messages to delete :partying_face:')
    }

    const resp = await textChannel.bulkDelete(param)
    await interaction.editReply(`Deleted ${resp.size} messages!`)
}

const builder = new SlashCommandBuilder().addNumberOption(option =>
    option.setName('count').setDescription('Number of messages to clean.').setRequired(true)
)

export default {
    name: 'clean',
    description: 'Cleans N number of messages.',
    handler,
    builder
} as Command
