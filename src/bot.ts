import client from './utils/client'
import commandMap from './utils/commands'

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    const command = commandMap.get(interaction.commandName)
    if (command?.handler) command.handler(interaction)
})

export default client
