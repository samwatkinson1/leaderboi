import client from './utils/client'
import commandMap from './utils/commands'
import logger from './utils/logger'
import * as reactions from './controllers/message_reactions'
import { indexAllMessageReactions } from './utils/message'
import { Guild } from 'discord.js'

let isIndexing = false

const handleDbErr = (err: Error) => {
    logger.error('db', err)
}

const startIndex = async (guild: Guild) => {
    logger.info('bot', `Index started @ ${Date.now()}`)

    isIndexing = true
    client.user?.setPresence({ activities: [{ name: 'Indexing...' }] })
    await indexAllMessageReactions(guild)
}

const endIndex = () => {
    logger.info('bot', `Index ended @ ${Date.now()}`)

    isIndexing = false
    client.user?.setPresence({})
}

client.on('guildCreate', async guild => {
    logger.info('bot', `Added to guild ${guild.name}`)

    // TODO: Do we need to prevent other indexes?

    await startIndex(guild)
    endIndex()
})

client.on('guildDelete', guild => {
    logger.info('bot', `Removed from guild ${guild.name}`)
    reactions
        .destroy({ guild_id: guild.id })
        .then(count => {
            logger.info('db', `Deleted ${count} entry(s) for guild ${guild.id}`)
        })
        .catch(handleDbErr)
})

client.on('messageReactionAdd', async (reaction, user) => {
    const newReaction = {
        guild_id: reaction.message.guild?.id ?? '',
        message_id: reaction.message.id,
        message_author_id: reaction.message.author?.id ?? '',
        reaction_id: reaction.emoji.identifier,
        reaction_user_id: user.id
    }

    reactions
        .create(newReaction)
        .then(entry => {
            logger.info(
                'db',
                `User ${entry?.reaction_user_id} added reaction ${entry?.reaction_id}`
            )
        })
        .catch(handleDbErr)
})

client.on('messageReactionRemove', (reaction, user) => {
    const removedReaction = {
        message_id: reaction.message.id,
        reaction_id: reaction.emoji.identifier,
        user_id: user.id
    }

    reactions
        .destroy(removedReaction)
        .then(count => {
            logger.info(
                'db',
                `Deleted ${count} entry(s) for message ${removedReaction.message_id}, reaction ${removedReaction.reaction_id}, user ${removedReaction.user_id}`
            )
        })
        .catch(handleDbErr)
})

client.on('messageDelete', message => {
    reactions
        .destroy({ message_id: message.id })
        .then(count => {
            logger.info('db', `Deleted ${count} entry(s) for message ${message.id}`)
        })
        .catch(handleDbErr)
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    if (isIndexing)
        return interaction.reply({ ephemeral: true, content: ':watch: Indexing please wait...' })

    const command = commandMap.get(interaction.commandName)
    if (command?.handler) command.handler(interaction)
})

export default client
