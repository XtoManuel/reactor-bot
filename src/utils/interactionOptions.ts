import { ChatInputCommandInteraction, CommandInteractionOptionResolver } from "discord.js";

interface ExtendedOptionResolver {
    _subcommand?: string;
    _hoistedOptions?: any[];
}

/**
 * Retrieves the interaction command by user.
 *
 * @param {ChatInputCommandInteraction} interaction - The interaction object.
 * @returns {object} - The interaction command.
 */
export function getInteractionCommandByUser(interaction: ChatInputCommandInteraction) {
    if (!interaction) {
        throw new Error("Invalid interaction object.");
    }

    // Check if interaction object is valid
    if (!interaction?.commandName || !interaction?.options) {
        throw new Error("Invalid interaction object.");
    }

    // Retrieve the name of the command from the interaction object
    const nameCommand = interaction.commandName;

    const options = interaction.options as CommandInteractionOptionResolver & ExtendedOptionResolver;

    // Retrieve the subcommand from the interaction options
    const subCommand = (options as ExtendedOptionResolver)._subcommand || null;

    // Retrieve the arguments of the command from the interaction options
    const argsCommand = (options as ExtendedOptionResolver)._hoistedOptions || [];

    // Return the interaction command
    return {
        nameCommand,
        subCommand,
        argsCommand
    };
}

/**
 * Creates a user interaction message based on the provided interaction.
 * @param {ChatInputCommandInteraction} interaction - The interaction object.
 * @returns {string} - The user interaction message.
 */
export function createUserInteractionMessage(interaction: ChatInputCommandInteraction): string {
    // Destructure the interaction command
    const { nameCommand, subCommand, argsCommand } = getInteractionCommandByUser(interaction);

    // Format the arguments into a string
    const formatArgs = (args: { name: string; value: unknown }[]) =>
        args.map((option: { name: string; value: unknown }) => `${option.name}: ${option.value}`).join(" ");

    // Create the sub-command name if it exists
    const subCommandName = subCommand ? `${subCommand} ` : "";

    // Map argsCommand to the expected format for formatArgs
    const mappedArgs = argsCommand.map((option: any) => ({
        name: option.name,
        value: option.value
    }));

    // Create the user interaction message
    return `/${nameCommand} ${subCommandName}${formatArgs(mappedArgs)}`;
}
