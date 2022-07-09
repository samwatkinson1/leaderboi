import { REST } from '@discordjs/rest'
import env from '../env'

const rest = new REST({ version: '10' }).setToken(env.TOKEN)

export default rest
