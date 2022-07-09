import { Command } from '../types/command'
import { SlashCommandBuilder } from '@discordjs/builders'
import {
    ChannelLogsQueryOptions,
    EmbedFieldData,
    MessageEmbed,
    MessageReaction,
    SnowflakeUtil,
    TextChannel
} from 'discord.js'
import { fetchChannel } from '../utils/interaction'
import dayjs from 'dayjs'
import { UniqueUserInteractions } from '../types/user'

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
): Promise<UniqueUserInteractions> => {
    const map = new Map() as UniqueUserInteractions

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

const renderReply = (param: string, interactions: UniqueUserInteractions): MessageEmbed => {
    const positionEmojis: { [key: number]: string } = {
        1: ':first_place:',
        2: ':second_place:',
        3: ':third_place:'
    }

    const fields: EmbedFieldData[] = [...interactions.entries()].map(([k, v], i) => {
        const pos = i + 1
        const name = positionEmojis[pos] ? `${positionEmojis[pos]} ${k}` : k
        return { name, value: `${v}`, inline: pos <= 3 }
    })

    return new MessageEmbed()
        .setTitle(`:drum: This months ${param} winners are...`)
        .addFields(fields)
}

// FIXME: Add validation to ensure only 1 emoji was passed
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
    const reply = renderReply(param, uniqueUserInteractions)

    return interaction.editReply({ embeds: [reply] })
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
