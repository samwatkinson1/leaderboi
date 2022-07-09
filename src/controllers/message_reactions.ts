import MessageReactions, { MessageReaction } from '../models/message_reactions'
import { Nullish } from '../types/util'

type MessageReactionReturn = Nullish<MessageReaction>

export const get = async (reaction: Partial<MessageReaction>): Promise<MessageReactionReturn[]> => {
    try {
        return await MessageReactions.find(reaction).exec()
    } catch (err) {
        const error = err as Error
        throw new Error(error.message)
    }
}

export const create = async (reaction: MessageReaction): Promise<MessageReactionReturn> => {
    try {
        const existingEntry = await MessageReactions.findOne(reaction).exec()

        if (existingEntry) {
            throw new Error('Could not create new entry as it already exists')
        }

        return await MessageReactions.create(reaction)
    } catch (err) {
        const error = err as Error
        throw new Error(error.message)
    }
}

export const destroy = async (reaction: Partial<MessageReaction>): Promise<number> => {
    try {
        const { deletedCount } = await MessageReactions.deleteMany(reaction).exec()
        return deletedCount
    } catch (err) {
        const error = err as Error
        throw new Error(error.message)
    }
}
