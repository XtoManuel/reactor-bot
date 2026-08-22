// src/commands/poll.ts

import {
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    MessageFlags,
    SlashCommandBuilder,
    TextChannel
} from "discord.js";

import { createReactionPoll } from "../services/poll.js";
import { commands } from "../data/dictionary.js";
import type { CustomClient } from "../types/CustomClient.js";

export const command = {
    name: "poll",

    aliases: ["make"],

    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription(commands?.poll?.desc || "N/A")

        .addSubcommand(subcommand =>
            subcommand
                .setName("message")
                .setDescription(commands?.poll?.subcommands?.message?.desc || "N/A")

                .addStringOption(option =>
                    option
                        .setName("content")
                        .setDescription(commands?.poll?.subcommands?.message?.opts?.content || "N/A")
                        .setRequired(true)
                        .setMaxLength(2000)
                )

                .addBooleanOption(option =>
                    option
                        .setName("noshrug")
                        .setDescription(commands?.poll?.subcommands?.message?.opts?.noshrug || "N/A")
                        .setRequired(false)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName("embed")
                .setDescription(commands?.poll?.subcommands?.embed?.desc || "N/A")

                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription(commands?.poll?.subcommands?.embed?.opts?.description || "N/A")
                        .setRequired(true)
                        .setMaxLength(4000)
                )

                .addStringOption(option =>
                    option
                        .setName("title")
                        .setDescription(commands?.poll?.subcommands?.embed?.opts?.title || "N/A")
                        .setRequired(false)
                        .setMaxLength(256)
                )

                .addStringOption(option =>
                    option
                        .setName("color")
                        .setDescription(commands?.poll?.subcommands?.embed?.opts?.color || "N/A")
                        .setRequired(false)
                )

                .addBooleanOption(option =>
                    option
                        .setName("noshrug")
                        .setDescription(commands?.poll?.subcommands?.embed?.opts?.noshrug || "N/A")
                        .setRequired(false)
                )
        ),

    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.channel?.isTextBased()) {
            await interaction.reply({
                content: "❌ Este comando solo puede utilizarse en un canal de texto.",
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        const subcommand = interaction.options.getSubcommand();

        const noShrug = interaction.options.getBoolean("noshrug") ?? false;

        if (subcommand === "message") {
            const content = interaction.options.getString("content", true);

            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            const pollMessage = await (interaction.channel as TextChannel).send(content);

            await createReactionPoll(interaction.client as CustomClient, pollMessage, {
                shrug: !noShrug
            });

            await interaction.editReply({
                content: "✅ Encuesta creada correctamente."
            });

            return;
        }

        if (subcommand === "embed") {
            const description = interaction.options.getString("description", true);

            const title = interaction.options.getString("title");

            const color = interaction.options.getString("color");

            const embed = new EmbedBuilder().setDescription(description);

            if (title) {
                embed.setTitle(title);
            }

            if (color) {
                try {
                    embed.setColor(color as ColorResolvable);
                } catch {
                    console.warn(`Color inválido para la encuesta: ${color}`);
                }
            }

            await interaction.deferReply({
                flags: MessageFlags.Ephemeral
            });

            const pollMessage = await (interaction.channel as TextChannel).send({
                embeds: [embed]
            });

            /*
             * Para los embeds usamos el título y la descripción
             * como texto a analizar para detectar los emojis.
             */
            const analysisContent = [title, description].filter(Boolean).join("\n");

            /*
             * Sobrescribimos temporalmente el contenido utilizado
             * para el análisis pasando una copia conceptual del mensaje.
             *
             * Si createReactionPoll solo analiza message.content,
             * conviene añadir soporte para content en sus opciones.
             */
            await createReactionPoll(interaction.client as CustomClient, pollMessage, {
                shrug: !noShrug,

                analysisContent
            });

            await interaction.editReply({
                content: "✅ Encuesta creada correctamente."
            });
        }
    }
};
