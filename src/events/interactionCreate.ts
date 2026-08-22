import { AutocompleteInteraction, CommandInteraction, MessageFlags, TextChannel } from "discord.js";
import { CustomClient } from "../types/CustomClient.js";

export default async function interactionCreate(client: CustomClient, interaction: CommandInteraction | AutocompleteInteraction) {
    // ─── Slash Command ─────────────────────────────
    if (interaction.isChatInputCommand()) {
        // No proceses en DMs
        if (!interaction.guild) {
            await interaction.reply({ content: "** **", flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        }

        console.log(`${interaction.user.tag} in #${(interaction.channel! as TextChannel).name} triggered an interaction.`);

        const commandName = interaction.commandName;
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            // Ejecuta el comando principal
            await command.run(interaction);
        } catch (error: unknown) {
            console.error(`Error ejecutando el comando ${commandName}:`, error instanceof Error ? error.stack : error);

            await safeReplyError(interaction);
        }
    }
}

/**
 * Safely replies with an error message to the user.
 *
 * @param {CommandInteraction} interaction - The interaction object.
 */
async function safeReplyError(interaction: CommandInteraction) {
    try {
        await interaction.reply({
            content: "Se produjo un error al ejecutar este comando.",
            flags: MessageFlags.Ephemeral
        });
    } catch {
        try {
            await interaction.editReply({
                content: "Se produjo un error al ejecutar este comando."
            });
        } catch (error: any) {
            console.error("Error replying to interaction:", error.stack);
        }
    }
}
