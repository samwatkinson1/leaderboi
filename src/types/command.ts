import { CommandInteraction } from 'discord.js'

export interface Command {
    name: string
    description: string
    handler: (interaction: CommandInteraction) => Promise<void> | void
}

export type ImportedCommand = object & {
    [key: string]: Command
}
