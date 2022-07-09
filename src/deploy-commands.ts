import * as commands from './commands'
import { buildCommands } from './utils/commands'
import env from './env'
import rest from './utils/rest'
import { Routes } from 'discord-api-types/v10'
import logger from './utils/logger'

const serializedCommands = buildCommands(commands).map(command => command.toJSON())

rest.put(Routes.applicationCommands(env.CLIENT_ID), { body: serializedCommands })
    .then(() => {
        logger.info('bot', 'Successfully registered application commands.')
    })
    .catch(err => {
        const error = err as Error
        throw new Error(`Could not register application commands! ${error.message}`)
    })
