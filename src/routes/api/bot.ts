import { Router } from 'express'
import { buildCommands } from '../../utils/commands'
import * as commands from '../../commands'

const router = Router()

router.get('/interactions', (req, res) => {
    const serializedCommands = buildCommands(commands).map(command => command.toJSON())
    res.json(serializedCommands)
})

export default router
