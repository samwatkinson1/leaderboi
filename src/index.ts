import bot from './bot'
import env from './env'
import server from './server'

bot.login(env.TOKEN)
server.start()
