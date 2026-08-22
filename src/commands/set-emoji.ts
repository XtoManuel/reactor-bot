// src/commands/set-emoji.ts

import { ChatInputCommandInteraction, ChannelType, PermissionFlagsBits, SlashCommandBuilder, MessageFlags } from "discord.js";

import { commands } from "../data/dictionary.js";

import { getPollEmoji, setPollEmoji } from "../database/poll.js";

import { CustomClient } from "../types/CustomClient.js";

export const command = {
    name: "set-emoji",

    aliases: ["emoji"],

    data: new SlashCommandBuilder()

        .setName("set-emoji")

        .setDescription(commands?.["set-emoji"]?.desc || "N/A")

        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Canal al que aplicar la configuración.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("yes")
                .setDescription(commands?.["set-emoji"]?.opts?.yes || "N/A")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("no")
                .setDescription(commands?.["set-emoji"]?.opts?.no || "N/A")
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName("shrug")
                .setDescription(commands?.["set-emoji"]?.opts?.shrug || "N/A")
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

        const client = interaction.client as CustomClient;

        const inputYes = interaction.options.getString("yes");

        const inputNo = interaction.options.getString("no");

        const inputShrug = interaction.options.getString("shrug");

        try {
            const current = await getPollEmoji(client.pool, { channelId: channel.id });

            // Valores por defecto si todavía no existe configuración
            const yes = inputYes ?? current?.yes ?? "👍🏻";

            const no = inputNo ?? current?.no ?? "👎🏻";

            let shrug: string | null;

            if (inputShrug?.toLowerCase() === "none") {
                // "none" elimina el emoji shrug
                shrug = null;
            } else if (inputShrug !== null) {
                shrug = inputShrug;
            } else {
                // Mantener el valor actual
                shrug = current?.shrug ?? "🤷🏻";
            }

            await setPollEmoji(client.pool, { channelId: channel.id, yes, no, shrug });

            await interaction.reply({
                content: `✅ Los emojis de las encuestas para ${channel} ` + "se han actualizado correctamente."
            });
        } catch (error) {
            console.error("Error al configurar los emojis de la encuesta:", error);

            await interaction.reply({
                content: "❌ No se pudieron guardar los emojis.",

                flags: MessageFlags.Ephemeral
            });
        }
    }
};
