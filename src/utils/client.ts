import { Client, Intents } from 'discord.js'
import logger from './logger'
import { OAuth2Scopes } from 'discord-api-types/v10'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.once('ready', c => {
    const invite = c.generateInvite({
        permissions: ['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'VIEW_CHANNEL'],
        scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands]
    })

    logger.info('bot', `Ready! Logged in as ${c.user.tag}`)
    logger.info('bot', `Use ${invite} to invite bot to a server.`)
})

export default client
