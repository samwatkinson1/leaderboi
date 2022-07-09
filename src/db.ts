import mongoose from 'mongoose'
import env from './env'
import logger from './utils/logger'

const start = async () => {
    try {
        const instance = await mongoose.connect(env.MONGO_URL)
        logger.info('db', `Connected to ${env.MONGO_URL} using ${instance.connection?.name}`)
    } catch (e) {
        logger.error('db', `Could not connect to ${env.MONGO_URL}`, e)
    }
}

export default { start }
