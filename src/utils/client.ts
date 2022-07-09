import { Client, Intents } from 'discord.js'
import logger from './logger'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.once('ready', c => {
    logger.info('bot', `Ready! Logged in as ${c.user.tag}`)
})

export default client
