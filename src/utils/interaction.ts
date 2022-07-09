import { CommandInteraction, GuildBasedChannel, User } from 'discord.js'
import { Nullish } from '../types/util'

type InteractionChannel = Nullish<GuildBasedChannel>

export const fetchChannel = async (
    interaction: CommandInteraction,
    force = false
): Promise<InteractionChannel> => {
    const channelId = interaction.channelId
    const channels = interaction.guild?.channels

    const cache = [...(channels?.cache.values() ?? [])]
    const cachedChannel = cache.find(item => item.id === channelId)

    if (!cachedChannel || force) return channels?.fetch(channelId)

    return cachedChannel
}

export const fetchUserById = async (
    interaction: CommandInteraction,
    id: User['id'],
    force = false
): Promise<User> => {
    const users = interaction.client.users

    const cache = [...users.cache.values()]
    const cachedUser = cache.find(item => item.id === id)

    if (!cachedUser || force) return users.fetch(id)

    return cachedUser
}
