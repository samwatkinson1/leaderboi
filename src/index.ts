import bot from './bot'
import env from './env'
import server from './server'
import db from './db'

db.start()
server.start()

bot.login(env.TOKEN)
