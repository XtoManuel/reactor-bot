// src/commands/reset-emojis.ts

import { ChannelType, ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

import { resetPollEmoji } from "../database/poll.js";

import { CustomClient } from "../types/CustomClient.js";

export const command = {
    name: "reset-emojis",

    data: new SlashCommandBuilder()

        .setName("reset-emojis")

        .setDescription(commands?.["reset-emojis"]?.desc || "N/A")

        .addChannelOption(option =>
            option

                .setName("channel")

                .setDescription(commands?.["reset-emojis"]?.opts?.channel || "N/A")

                .addChannelTypes(ChannelType.GuildText)

                .setRequired(false)
        ),

    async run(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel("channel") ?? interaction.channel;

        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: "❌ Debes seleccionar un canal de texto válido.",

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

        try {
            await resetPollEmoji(
                (interaction.client as CustomClient).pool,

                channel.id
            );

            await interaction.reply({
                content:
                    `✅ Los emojis personalizados de ${channel} se han eliminado.\n` +
                    "Ahora utilizará los emojis por defecto del servidor o, si no existen, los del bot."
            });
        } catch (error) {
            console.error("Error al restablecer los emojis:", error);

            await interaction.reply({
                content: "❌ No se pudieron restablecer los emojis.",

                flags: MessageFlags.Ephemeral
            });
        }
    }
};
