import { Router } from 'express'

const route = Router()

route.get('/health', (req, res) => {
    res.sendStatus(200)
})

export default route
