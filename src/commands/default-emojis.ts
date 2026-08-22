// src/commands/default-emojis.ts

import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

import { setDefaultPollEmoji } from "../database/poll.js";

import { CustomClient } from "../types/CustomClient.js";

export const command = {
    name: "default-emojis",

    data: new SlashCommandBuilder()

        .setName("default-emojis")

        .setDescription(commands?.["default-emojis"]?.desc || "N/A")

        .addStringOption(option =>
            option

                .setName("yes")

                .setDescription(commands?.["default-emojis"]?.opts?.yes || "N/A")

                .setRequired(true)
        )

        .addStringOption(option =>
            option

                .setName("no")

                .setDescription(commands?.["default-emojis"]?.opts?.no || "N/A")

                .setRequired(true)
        )

        .addStringOption(option =>
            option

                .setName("shrug")

                .setDescription(commands?.["default-emojis"]?.opts?.shrug || "N/A")

                .setRequired(false)
        ),

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) {
            await interaction.reply({
                content: "❌ Este comando solo puede utilizarse dentro de un servidor.",

                flags: MessageFlags.Ephemeral
            });

            return;
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
            await interaction.reply({
                content: "❌ Necesitas el permiso `Gestionar canales` para usar este comando.",

                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const yes = interaction.options.getString("yes", true);

        const no = interaction.options.getString("no", true);

        const shrugInput = interaction.options.getString("shrug");

        const shrug = shrugInput?.toLowerCase() === "none" ? null : (shrugInput ?? undefined);

        try {
            await setDefaultPollEmoji(
                (interaction.client as CustomClient).pool,

                interaction.guildId,

                yes,

                no,

                shrug
            );

            await interaction.reply({
                content:
                    `✅ Los emojis por defecto del servidor se han actualizado.\n\n` +
                    `👍🏻 Sí: ${yes}\n` +
                    `👎🏻 No: ${no}\n` +
                    `🤷🏻 Shrug: ${shrug ?? "Desactivado"}`
            });
        } catch (error) {
            console.error("Error al configurar los emojis por defecto:", error);

            await interaction.reply({
                content: "❌ No se pudieron guardar los emojis por defecto.",

                flags: MessageFlags.Ephemeral
            });
        }
    }
};
