import dotenv from 'dotenv'
import { EnvironmentError } from './utils/error'

dotenv.config()

const environment = {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? '',
    MONGO_URL: process.env.MONGO_URL ?? '',
    TOKEN: process.env.DISCORD_TOKEN ?? '',
    PORT: process.env.PORT
}

if (!environment.CLIENT_ID) {
    throw new EnvironmentError('Missing DISCORD_CLIENT_ID in environment variables.')
}

if (!environment.MONGO_URL) {
    throw new EnvironmentError('Missing DATABASE_URL in environment variables.')
}

if (!environment.TOKEN) {
    throw new EnvironmentError('Missing DISCORD_TOKEN in environment variables.')
}

if (!environment.PORT) {
    throw new EnvironmentError('Missing PORT in environment variables.')
}

export default environment
