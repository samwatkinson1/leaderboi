db = new Mongo().getDB('test')
db.createCollection('message_reactions', { capped: false })
