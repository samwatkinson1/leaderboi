import { Guild, GuildEmoji, MessageReaction, ReactionEmoji, TextChannel } from 'discord.js'
import logger from './logger'
import * as messageReactions from '../controllers/message_reactions'
import { Nullish } from '../types/util'

type Emoji = GuildEmoji | ReactionEmoji

const getEmojiId = (emoji: Emoji, guild: Nullish<Guild>) => {
    const identifier = guild?.emojis.resolveIdentifier(emoji.identifier)

    if (!identifier) {
        throw new Error('Bad emoji!')
    }

    return identifier
}

const indexMessageReaction = async (reaction: MessageReaction) => {
    logger.info('bot', `Indexing ${reaction.message.id}...`)
    const users = await reaction.users.fetch()

    await Promise.all(
        users.map(user =>
            messageReactions.create({
                guild_id: reaction.message.guild?.id ?? '',
                message_id: reaction.message.id,
                message_author_id: reaction.message.author?.id ?? '',
                reaction_id: getEmojiId(reaction.emoji, reaction.message.guild),
                reaction_user_id: user.id
            })
        )
    )

    logger.info('bot', `Done ${reaction.message.id}`)
}

const indexMessageReactionsForChannel = async (channel: TextChannel) => {
    logger.info('bot', `Indexing ${channel.name}...`)

    const _f = async (before?: string): Promise<void> => {
        const _m = await channel.messages.fetch({ limit: 100, before })
        if (!_m.size) return

        const reactions = _m.map(message => [...message.reactions.cache.values()]).flat()
        await Promise.all(
            reactions.filter(item => item.message.type === 'DEFAULT').map(indexMessageReaction)
        )

        return _f(_m.last()?.id)
    }

    return _f()
}

export const indexAllMessageReactions = async (guild: Guild) => {
    const channels = await guild.channels.fetch(undefined, { cache: false })
    const textChannels = [...channels.values()].filter(item => item.type === 'GUILD_TEXT')

    return Promise.all(
        textChannels.map(item => indexMessageReactionsForChannel(item as TextChannel))
    )
        .then(fulfilled => logger.info('bot', `Successfully indexed ${fulfilled.length} channels`))
        .catch(rejected => logger.error('bot', `Failed to index ${rejected.length} channels`))
}
