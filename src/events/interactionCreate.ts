import { Interaction, MessageFlags, TextChannel } from "discord.js";
import { CustomClient } from "../types/CustomClient.js";

import { handlePollModal } from "../commands/poll.js";

export default async function interactionCreate(client: CustomClient, interaction: Interaction): Promise<void> {
    // ─── Slash Command ─────────────────────────────

    if (interaction.isChatInputCommand()) {
        // No proceses en DMs
        if (!interaction.guild) {
            await interaction.reply({
                content: "** **",
                flags: MessageFlags.Ephemeral
            });

            await interaction.deleteReply();

            return;
        }

        console.log(`${interaction.user.tag} in #${(interaction.channel! as TextChannel).name} triggered an interaction.`);

        const commandName = interaction.commandName;

        const command = client.commands.get(commandName);

        if (!command) {
            return;
        }

        try {
            await command.run(interaction);
        } catch (error: unknown) {
            console.error(`Error ejecutando el comando ${commandName}:`, error instanceof Error ? error.stack : error);

            await safeReplyError(interaction);
        }

        return;
    }

    // ─── Modal ─────────────────────────────────────

    if (interaction.isModalSubmit()) {
        // No proceses modales en DMs
        if (!interaction.guild) {
            return;
        }

        try {
            if (interaction.customId.startsWith("poll_message:") || interaction.customId.startsWith("poll_embed:")) {
                await handlePollModal(interaction);
            }
        } catch (error: unknown) {
            console.error(`Error procesando el modal ${interaction.customId}:`, error instanceof Error ? error.stack : error);

            await safeReplyError(interaction);
        }
    }
}

// src/events/interactionCreate.ts

/**
 * Safely replies with an error message to the user.
 *
 * @param interaction - The interaction object.
 */
async function safeReplyError(interaction: Interaction): Promise<void> {
    if (!interaction.isRepliable()) {
        return;
    }

    try {
        // La interacción ya fue diferida
        if (interaction.deferred) {
            await interaction.editReply({
                content: "❌ Se produjo un error al procesar esta interacción."
            });

            return;
        }

        // La interacción ya recibió una respuesta
        if (interaction.replied) {
            await interaction.followUp({
                content: "❌ Se produjo un error al procesar esta interacción.",
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        // La interacción todavía no ha recibido respuesta
        await interaction.reply({
            content: "❌ Se produjo un error al procesar esta interacción.",
            flags: MessageFlags.Ephemeral
        });
    } catch (error: unknown) {
        console.error("Error respondiendo a la interacción:", error instanceof Error ? error.stack : error);
    }
}
