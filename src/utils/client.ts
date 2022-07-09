import { Client, Intents } from 'discord.js'
import logger from './logger'
import env from '../env'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.once('ready', c => {
    const invite =
        'https://discord.com/api/oauth2/authorize?client_id={client_id}&permissions=68608&scope=applications.commands%20bot'

    logger.info('bot', `Ready! Logged in as ${c.user.tag}`)
    logger.info(
        'bot',
        `Use ${invite.replace('{client_id}', env.CLIENT_ID)} to invite bot to a server.`
    )
})

export default client
