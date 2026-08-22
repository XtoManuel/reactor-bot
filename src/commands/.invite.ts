// src/commands/invite.ts

import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

export const command = {
    name: "invite",

    data: new SlashCommandBuilder()

        .setName("invite")

        .setDescription(commands?.invite?.desc || "N/A"),

    async run(interaction: ChatInputCommandInteraction) {
        const permissions = [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.AddReactions,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.UseExternalEmojis
        ];

        const permissionsValue = permissions.reduce((total, permission) => total | permission, 0n);

        const inviteUrl =
            `https://discord.com/oauth2/authorize` +
            `?client_id=${interaction.client.user.id}` +
            `&permissions=${permissionsValue.toString()}` +
            `&scope=bot%20applications.commands`;

        await interaction.reply({
            content: `🔗 Puedes invitar al bot usando este enlace:\n${inviteUrl}`
        });
    }
};
