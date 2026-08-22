// src/commands/command.ts

import { ChannelType, ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

import { setPollEmoji, setCommandlessChannel, unsetCommandlessChannel } from "../database/poll.js";

import type { CustomClient } from "../types/CustomClient.js";

export const command = {
    name: "commandless",

    data: new SlashCommandBuilder()
        .setName("commandless")
        .setDescription(commands?.commandless?.desc || "N/A")

        // Las opciones obligatorias deben ir primero
        .addBooleanOption(option =>
            option
                .setName("enabled")
                .setDescription(commands?.commandless?.opts?.enabled || "N/A")
                .setRequired(true)
        )

        // Opcionales después
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription(commands?.commandless?.opts?.channel || "N/A")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("yes")
                .setDescription(commands?.commandless?.opts?.yes || "N/A")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("no")
                .setDescription(commands?.commandless?.opts?.no || "N/A")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("shrug")
                .setDescription(commands?.commandless?.opts?.shrug || "N/A")
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

        const enabled = interaction.options.getBoolean("enabled", true);

        const yes = interaction.options.getString("yes") ?? "👍🏻";
        const no = interaction.options.getString("no") ?? "👎🏻";
        const shrug = interaction.options.getString("shrug") ?? "🤷🏻";

        try {
            const pool = (interaction.client as CustomClient).pool;

            if (enabled) {
                await setCommandlessChannel(pool, {
                    channelId: channel.id,
                    guildId: interaction.guildId!
                });

                await setPollEmoji(pool, {
                    channelId: channel.id,
                    guildId: interaction.guildId!,
                    yes,
                    no,
                    shrug
                });
            } else {
                await unsetCommandlessChannel(pool, {
                    channelId: channel.id,
                    guildId: interaction.guildId!
                });
            }

            await interaction.reply({
                content: enabled
                    ? `✅ El modo sin prefijo se ha activado en ${channel}.`
                    : `✅ El modo sin prefijo se ha desactivado en ${channel}.`
            });
        } catch (error) {
            console.error("Error al configurar el modo commandless:", error);

            await interaction.reply({
                content: "❌ No se pudo actualizar la configuración.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
