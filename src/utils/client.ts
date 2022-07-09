import { Client, Intents } from 'discord.js'

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

client.once('ready', c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

export default client
