db = new Mongo().getDB('leaderboi')
db.createCollection('message_reactions', { capped: false })
