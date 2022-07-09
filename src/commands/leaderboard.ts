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
import { Nullish } from '../types/util'

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

const renderReply = (
    param: string,
    interactions: UniqueUserInteractions,
    all: Nullish<boolean>
): MessageEmbed => {
    const positionEmojis: { [key: number]: string } = {
        1: ':first_place:',
        2: ':second_place:',
        3: ':third_place:'
    }

    const fields: EmbedFieldData[] = [...interactions.entries()]
        .sort(([, av], [, bv]) => av - bv)
        .map(([k, v], i) => {
            const pos = i + 1
            const name = positionEmojis[pos] ? `${positionEmojis[pos]} ${k}` : k
            return { name, value: `${v}`, inline: pos <= 3 }
        })

    const title = all
        ? `:drum: The all time ${param} winners are...`
        : `:drum: This months ${param} winners are...`

    return new MessageEmbed().setTitle(title).addFields(fields)
}

// FIXME: Add validation to ensure only 1 emoji was passed
const handler: Command['handler'] = async interaction => {
    await interaction.deferReply({ ephemeral: true })

    const allParam = interaction.options.getBoolean('all', false)
    const emojiParam = interaction.options.getString('emoji', true)

    const channel = await fetchChannel(interaction)
    if (!channel || !channel?.isText()) {
        return interaction.editReply('/interaction can only be used in a text chat!')
    }

    const textChannel = channel as TextChannel
    const reactions = await getReactionsForChannel(textChannel, allParam ? {} : undefined)

    if (!reactions.length) {
        return interaction.editReply('No reactions found this month!')
    }

    const identifiedEmoji = interaction.guild?.emojis.resolveIdentifier(emojiParam)
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
    const reply = renderReply(emojiParam, uniqueUserInteractions, allParam)

    return interaction.editReply({ embeds: [reply] })
}

const builder = new SlashCommandBuilder()
    .addStringOption(option =>
        option
            .setName('emoji')
            .setDescription('The emoji to generate statistics for.')
            .setRequired(true)
    )
    .addBooleanOption(option =>
        option
            .setName('all')
            .setDescription('Retrieve statistics for all messages in current channel')
            .setRequired(false)
    )

export default {
    name: 'leaderboard',
    description: 'Give a reaction and measure who has used it the most for a month or forever!',
    builder,
    handler
} as Command
