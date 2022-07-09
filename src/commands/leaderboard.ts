import { Command } from '../types/command'
import { SlashCommandBuilder } from '@discordjs/builders'
import { ChannelLogsQueryOptions, MessageReaction, SnowflakeUtil, TextChannel } from 'discord.js'
import { fetchChannel } from '../utils/interaction'
import dayjs from 'dayjs'

const getReactionsForChannel = async (
    channel: TextChannel,
    options: ChannelLogsQueryOptions = { limit: 100 }
): Promise<MessageReaction[]> => {
    const startOfMonth = dayjs().startOf('month')
    const today = new Date()

    const messages = await channel.messages.fetch({
        after: SnowflakeUtil.generate(startOfMonth.toDate()),
        before: SnowflakeUtil.generate(today),
        ...options
    })

    const reactions = messages.map(message => message.reactions.cache)
    const reactionCollection = reactions.map(reaction => [...reaction.values()])

    return reactionCollection.flat()
}

const getUniqueUserInteractions = async (
    reactions: MessageReaction[]
): Promise<Map<string, number>> => {
    const map = new Map<string, number>()

    await Promise.all(reactions.map(item => item.users.fetch()))

    reactions.forEach(reaction => {
        const users = [...reaction.users.cache.values()]
        users.forEach(user => {
            const id = user.username

            if (map.has(id)) {
                const prev = map.get(id) ?? 0
                return map.set(id, prev + 1)
            }

            return map.set(id, 1)
        })
    })

    return map
}

// TODO: Validate only 1 emoji was passed
// TODO: Pretty print reply
// TODO: Stress test
const handler: Command['handler'] = async interaction => {
    await interaction.deferReply({ ephemeral: true })

    const param = interaction.options.getString('emoji', true)

    const channel = await fetchChannel(interaction)
    if (!channel || !channel?.isText()) {
        return interaction.editReply('/interaction can only be used in a text chat!')
    }

    const textChannel = channel as TextChannel
    const reactions = await getReactionsForChannel(textChannel)

    if (!reactions.length) {
        return interaction.editReply('No reactions found this month!')
    }

    const identifiedEmoji = interaction.guild?.emojis.resolveIdentifier(param)
    if (!identifiedEmoji) {
        return interaction.editReply('Error: Bad Emoji')
    }

    const filteredReactions = reactions.filter(
        reaction =>
            interaction.guild?.emojis.resolveIdentifier(reaction.emoji.identifier) ===
            identifiedEmoji
    )
    if (!filteredReactions.length) {
        return interaction.editReply('No reactions found this month!')
    }

    const uniqueUserInteractions = await getUniqueUserInteractions(filteredReactions)
    console.log(uniqueUserInteractions)

    const reply = [...uniqueUserInteractions.entries()].map(([k, v]) => `${k} - ${v}`).join('\n')

    await interaction.editReply(reply)
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
