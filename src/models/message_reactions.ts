import { model, Schema } from 'mongoose'

export interface MessageReaction {
    guild_id: string
    message_id: string
    message_author_id: string
    reaction_id: string
    reaction_user_id: string
}

const schema = new Schema<MessageReaction>({
    guild_id: {
        type: String,
        required: true
    },
    message_id: {
        type: String,
        required: true
    },
    message_author_id: {
        type: String,
        required: true
    },
    reaction_id: {
        type: String,
        required: true
    },
    reaction_user_id: {
        type: String,
        required: true
    }
})

export default model<MessageReaction>('message_reactions', schema)
