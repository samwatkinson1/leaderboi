import mongoose from 'mongoose'
import env from './env'
import logger from './utils/logger'

const start = async () => {
    try {
        const instance = await mongoose.connect(env.MONGO_URL)
        instance.connection?.useDb(env.MONGO_DATABASE)
        logger.info('db', `Connected to ${env.MONGO_URL} using ${env.MONGO_DATABASE}`)
    } catch (e) {
        logger.error('db', `Could not connect to ${env.MONGO_URL}`, e)
    }
}

export default { start }
