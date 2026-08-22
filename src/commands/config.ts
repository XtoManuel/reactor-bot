// src/commands/config.ts

import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

import type { CustomClient } from "../types/CustomClient.js";

import { getCommandlessChannels, getDefaultPollEmoji, getPollEmojiChannels } from "../database/poll.js";

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
            // ─── Configuración por defecto del servidor ─────────────

            const defaultEmojis = await getDefaultPollEmoji(client.pool, {
                guildId: interaction.guild.id
            });

            const serverEmojis = defaultEmojis ?? DEFAULT_EMOJIS;

            // ─── Canales commandless ───────────────────────────────

            const commandlessChannels = await getCommandlessChannels(client.pool, {
                guildId: interaction.guild.id
            });

            // ─── Canales con emojis personalizados ─────────────────

            const emojiChannels = await getPollEmojiChannels(client.pool, {
                guildId: interaction.guild.id
            });

            // ─── Preparar datos ────────────────────────────────────

            const commandlessIds = new Set(commandlessChannels.map(({ channelId }) => channelId));

            const emojiMap = new Map(emojiChannels.map(({ channelId, emojis }) => [channelId, emojis]));

            // Combinar todos los canales sin duplicados
            const channelIds = new Set([...commandlessIds, ...emojiMap.keys()]);

            // ─── Crear embed ───────────────────────────────────────

            const embed = new EmbedBuilder().setTitle("⚙️ Configuración del servidor").setColor("Blurple");

            // ─── Emojis por defecto ────────────────────────────────

            embed.addFields({
                name: "Emojis por defecto",

                value: [
                    defaultEmojis ? "Configuración personalizada." : "Usando configuración global.",

                    `Sí: ${serverEmojis.yes}`,

                    `No: ${serverEmojis.no}`,

                    `Adicional: ${serverEmojis.shrug ?? "Desactivado"}`
                ].join("\n")
            });

            // ─── Configuración de canales ──────────────────────────

            if (channelIds.size === 0) {
                embed.addFields({
                    name: "Configuración de canales",

                    value: "No hay ningún canal con una configuración personalizada."
                });
            } else {
                const channels = await Promise.all(
                    [...channelIds].map(async channelId => {
                        const channel = interaction.guild?.channels.cache.get(channelId);

                        if (!channel) {
                            return null;
                        }

                        const emojis = emojiMap.get(channelId);

                        const isCommandless = commandlessIds.has(channelId);

                        const config: string[] = [`${channel}`];

                        // Estado commandless

                        if (isCommandless) {
                            config.push("Modo commandless: Activado");
                        }

                        // Emojis personalizados

                        if (emojis) {
                            config.push(
                                `Sí: ${emojis.yes}`,

                                `No: ${emojis.no}`,

                                `Adicional: ${emojis.shrug ?? "Desactivado"}`
                            );
                        } else {
                            config.push("Emojis: Predeterminados");
                        }

                        return config.join("\n");
                    })
                );

                const channelList = channels.filter((channel): channel is string => channel !== null);

                embed.addFields({
                    name: "Configuración de canales",

                    value: channelList.join("\n\n") || "No hay canales disponibles."
                });
            }

            // ─── Enviar respuesta ──────────────────────────────────

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
