import { Router } from 'express'
import botRouter from './bot'

const route = Router()

route.get('/health', (req, res) => {
    res.sendStatus(200)
})

route.use('/bot', botRouter)

export default route
