// src/commands/poll.ts

import {
    ChatInputCommandInteraction,
    ColorResolvable,
    EmbedBuilder,
    LabelBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    SlashCommandBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

import { createReactionPoll } from "../services/poll.js";

import { commands } from "../data/dictionary.js";
import { CustomClient } from "../types/CustomClient.js";

const MESSAGE_MODAL_PREFIX = "poll_message:";
const EMBED_MODAL_PREFIX = "poll_embed:";

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
        const subcommand = interaction.options.getSubcommand();

        // Por defecto: añadir 🤷
        const noShrug = interaction.options.getBoolean("noshrug") ?? false;

        if (subcommand === "message") {
            const modal = new ModalBuilder().setCustomId(`${MESSAGE_MODAL_PREFIX}${noShrug}`).setTitle("Crear encuesta");

            const contentInput = new TextInputBuilder()
                .setCustomId("content")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(2000);

            const contentLabel = new LabelBuilder().setLabel("Contenido de la encuesta").setTextInputComponent(contentInput);

            modal.addLabelComponents(contentLabel);

            await interaction.showModal(modal);

            return;
        }

        if (subcommand === "embed") {
            const color = interaction.options.getString("color") ?? "000000";

            const modal = new ModalBuilder()
                .setCustomId(`${EMBED_MODAL_PREFIX}${noShrug}:${encodeURIComponent(color)}`)
                .setTitle("Crear encuesta con embed");

            const titleInput = new TextInputBuilder()
                .setCustomId("title")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setMaxLength(256);

            const descriptionInput = new TextInputBuilder()
                .setCustomId("description")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMaxLength(4000);

            const titleLabel = new LabelBuilder().setLabel("Título").setTextInputComponent(titleInput);

            const descriptionLabel = new LabelBuilder().setLabel("Contenido").setTextInputComponent(descriptionInput);

            modal.addLabelComponents(titleLabel, descriptionLabel);

            await interaction.showModal(modal);
        }
    }
};

export async function handlePollModal(interaction: ModalSubmitInteraction) {
    if (!interaction.channel?.isTextBased()) {
        return;
    }

    const { customId } = interaction;

    if (customId.startsWith(MESSAGE_MODAL_PREFIX)) {
        const noShrug = customId.replace(MESSAGE_MODAL_PREFIX, "") === "true";

        const content = interaction.fields.getTextInputValue("content");

        await interaction.deferReply({
            ephemeral: true
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

    if (customId.startsWith(EMBED_MODAL_PREFIX)) {
        const data = customId.replace(EMBED_MODAL_PREFIX, "");

        const [noShrugValue, encodedColor] = data.split(":");

        const noShrug = noShrugValue === "true";

        const color = decodeURIComponent(encodedColor ?? "");

        const title = interaction.fields.getTextInputValue("title");

        const description = interaction.fields.getTextInputValue("description");

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
            ephemeral: true
        });

        const pollMessage = await (interaction.channel as TextChannel).send({
            embeds: [embed]
        });

        await createReactionPoll(interaction.client as CustomClient, pollMessage, {
            shrug: !noShrug
        });

        await interaction.editReply({
            content: "✅ Encuesta creada correctamente."
        });
    }
}
