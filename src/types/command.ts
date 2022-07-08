import { CommandInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

export interface Command {
    // Name of command
    name: string
    // Description of command
    description: string
    // How to respond to the given interaction
    handler: (interaction: CommandInteraction) => Promise<void> | void
    // Override default builder, useful for adding options or other customizations
    builder?: SlashCommandBuilder
}

export type ImportedCommand = object & {
    [key: string]: Command
}
