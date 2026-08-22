// src/commands/config.ts

import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

import type { CustomClient } from "../types/CustomClient.js";
import { getCommandlessChannels, getDefaultPollEmoji, getPollEmoji } from "../database/poll.js";

import { DEFAULT_EMOJIS } from "../config/defaults.js";

export const command = {
    name: "config",

    data: new SlashCommandBuilder().setName("config").setDescription(commands.config.desc || "N/A"),

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            await interaction.reply({
                content: "❌ Este comando solo puede utilizarse en un servidor.",
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            await interaction.reply({
                content: "❌ Necesitas el permiso `Gestionar servidor` para usar este comando.",
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const client = interaction.client as CustomClient;

        try {
            // Obtener configuración por defecto del servidor
            let defaultEmojis = await getDefaultPollEmoji(client.pool, { guildId: interaction.guild.id });

            // Obtener canales commandless
            const commandlessChannels = await getCommandlessChannels(client.pool, {
                guildId: interaction.guild.id
            });

            const embed = new EmbedBuilder().setTitle("⚙️ Configuración del servidor").setColor("Blurple");

            if (defaultEmojis) {
                embed.addFields({
                    name: "Emojis por defecto",
                    value: [
                        `Sí: ${defaultEmojis.yes}`,
                        `No: ${defaultEmojis.no}`,
                        `Adicional: ${defaultEmojis.shrug ?? "Desactivado"}`
                    ].join("\n")
                });
            } else {
                embed.addFields({
                    name: "Emojis por defecto",
                    value: [
                        "No hay configuración por defecto.\n",
                        `Sí: ${DEFAULT_EMOJIS.yes}`,
                        `No: ${DEFAULT_EMOJIS.no}`,
                        `Adicional: ${DEFAULT_EMOJIS.shrug ?? "Desactivado"}`
                    ].join("\n")
                });
            }

            if (commandlessChannels.length === 0) {
                embed.addFields({
                    name: "Canales commandless",
                    value: "No hay ningún canal configurado."
                });
            } else {
                const channels = await Promise.all(
                    commandlessChannels.map(async ({ channelId }) => {
                        const channel = interaction.guild?.channels.cache.get(channelId);

                        if (!channel) {
                            return null;
                        }

                        const emojis = await getPollEmoji(client.pool, {
                            channelId
                        });

                        const customEmoji =
                            emojis &&
                            defaultEmojis &&
                            (emojis.yes !== defaultEmojis.yes ||
                                emojis.no !== defaultEmojis.no ||
                                emojis.shrug !== defaultEmojis.shrug);

                        if (!customEmoji) {
                            return `${channel} — Predeterminado`;
                        }

                        return [
                            `${channel}`,
                            `Sí: ${emojis.yes}`,
                            `No: ${emojis.no}`,
                            `Adicional: ${emojis.shrug ?? "Desactivado"}`
                        ].join("\n");
                    })
                );

                embed.addFields({
                    name: "Canales commandless",
                    value: channels.filter((channel): channel is string => channel !== null).join("\n\n")
                });
            }

            await interaction.reply({
                embeds: [embed]
            });
        } catch (error) {
            console.error("Error obteniendo la configuración:", error);

            await interaction.reply({
                content: "❌ No se pudo obtener la configuración del servidor.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
