import dotenv from 'dotenv'
import { EnvironmentError } from './utils/error'

dotenv.config()

const environment = {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? '',
    TOKEN: process.env.DISCORD_TOKEN ?? ''
}

if (!environment.CLIENT_ID) {
    throw new EnvironmentError('Missing DISCORD_CLIENT_ID in environment variables.')
}

if (!environment.TOKEN) {
    throw new EnvironmentError('Missing DISCORD_TOKEN in environment variables.')
}

export default environment
