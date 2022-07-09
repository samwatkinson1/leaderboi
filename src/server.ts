import express from 'express'
import env from './env'
import logger from './utils/logger'
import api from './routes/api'

const app = express()

app.use('/api', api)

const start = () => {
    app.listen(env.PORT, () => {
        logger.info('server', `Server is running on ${env.PORT}`)
    })
}

export default { start }
