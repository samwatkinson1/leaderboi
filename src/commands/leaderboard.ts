import { Command } from '../types/command'
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, EmbedFieldData, MessageEmbed } from 'discord.js'
import { UniqueUserInteractions } from '../types/user'
import * as reactions from '../controllers/message_reactions'
import { MessageReaction } from '../models/message_reactions'
import client from '../utils/client'
import { fetchChannel, fetchUserById } from '../utils/interaction'
import { errorReply } from '../utils/error'

const getUniqueUserInteractions = async (
    items: MessageReaction[],
    interaction: CommandInteraction
): Promise<UniqueUserInteractions> => {
    const map = new Map() as UniqueUserInteractions

    await Promise.all(items.map(item => fetchUserById(interaction, item.message_author_id)))

    items.forEach(reaction => {
        const user = client.users.cache.get(reaction.message_author_id)
        if (!user) return

        const id = user.username

        if (map.has(id)) {
            const prev = map.get(id) ?? 0
            return map.set(id, prev + 1)
        }

        return map.set(id, 1)
    })

    return map
}

const renderReply = (param: string, interactions: UniqueUserInteractions): MessageEmbed => {
    const positionEmojis: { [key: number]: string } = {
        1: ':first_place:',
        2: ':second_place:',
        3: ':third_place:'
    }

    const fields: EmbedFieldData[] = [...interactions.entries()]
        .sort(([, av], [, bv]) => bv - av)
        .map(([k, v], i) => {
            const pos = i + 1
            const name = positionEmojis[pos] ? `${positionEmojis[pos]} ${k}` : k
            return { name, value: `${v}`, inline: pos <= 3 }
        })

    return new MessageEmbed()
        .setTitle(`:drum: The all time ${param} winners are...`)
        .addFields(fields)
}

// FIXME: Add validation to ensure only 1 emoji was passed
const handler: Command['handler'] = async interaction => {
    await interaction.deferReply({ ephemeral: true })

    const emojiParam = interaction.options.getString('emoji', true)

    const channel = await fetchChannel(interaction)
    if (!channel || !channel?.isText()) {
        return interaction.editReply('/interaction can only be used in a text chat!')
    }

    const identifiedEmoji = interaction.guild?.emojis.resolveIdentifier(emojiParam)
    if (!identifiedEmoji) {
        return interaction.editReply(errorReply("Looks like that emoji isn't valid"))
    }

    const guildId = interaction.guild?.id
    if (!guildId) {
        return interaction.editReply(errorReply('An unknown error occurred'))
    }

    const fetchedReactions = await reactions.get({
        guild_id: guildId,
        reaction_id: identifiedEmoji
    })
    if (!fetchedReactions.length) {
        return interaction.editReply(errorReply(`Could not find any reactions using ${emojiParam}`))
    }

    const uniqueUserInteractions = await getUniqueUserInteractions(
        fetchedReactions as MessageReaction[],
        interaction
    )

    const reply = renderReply(emojiParam, uniqueUserInteractions)

    return interaction.editReply({ embeds: [reply] })
}

const builder = new SlashCommandBuilder().addStringOption(option =>
    option.setName('emoji').setDescription('The emoji to fetch statistics for.').setRequired(true)
)

export default {
    name: 'leaderboard',
    description: 'Provide an emoji and measure who has used it the most!',
    builder,
    handler
} as Command
