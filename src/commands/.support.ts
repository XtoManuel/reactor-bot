// src/commands/support.ts

import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";

import { commands } from "../data/dictionary.js";

import config from "../utils/config.js";

export const command = {
    name: "support",

    data: new SlashCommandBuilder()

        .setName("support")

        .setDescription(commands?.support?.desc || "N/A"),

    async run(interaction: ChatInputCommandInteraction) {
        const inviteCode = config.support_server_invite_code;

        if (!inviteCode) {
            await interaction.reply({
                content: "❌ El servidor de soporte no está configurado.",

                flags: MessageFlags.Ephemeral
            });

            return;
        }

        try {
            await interaction.user.send(`Aquí tienes el enlace del servidor de soporte:\n` + `https://discord.gg/${inviteCode}`);

            await interaction.reply({
                content: "📬 Te he enviado el enlace del servidor de soporte por mensaje privado.",

                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            console.error("No se pudo enviar el enlace de soporte por MD:", error);

            await interaction.reply({
                content:
                    "❌ No he podido enviarte un mensaje privado. " + "Comprueba que tienes los mensajes directos activados.",

                flags: MessageFlags.Ephemeral
            });
        }
    }
};
