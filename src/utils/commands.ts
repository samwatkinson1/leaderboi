import * as commands from '../commands'
import { Command, ImportedCommand } from '../types/command'
import { SlashCommandBuilder } from '@discordjs/builders'

export const buildCommands = (_commands: ImportedCommand) => {
    return Object.values(_commands).map(command => {
        const builder = command?.builder ?? new SlashCommandBuilder()
        builder.setName(command.name).setDescription(command.description)
        return builder
    })
}

const commandMap = new Map<string, Command>()
Object.values(commands).map(command => commandMap.set(command.name, command))

export default commandMap
