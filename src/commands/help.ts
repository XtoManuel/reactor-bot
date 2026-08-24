// src/commands/help.ts

import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";

import { commands } from "../data/dictionary.js";

import config from "../utils/config.js";

export const command = {
	name: "help",

	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription(commands.help.desc),

	async run(interaction: ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle("Help for Reactor")
			.setDescription(
				"Poll Reactor te permite crear encuestas mediante reacciones y configurar su comportamiento en cada servidor.",
			)

			.addFields(
				{
					name: "Poll",
					value:
						`Uso: \`/poll message\`${config.prefixes.length > 0 ? " o " : ""}${config.prefixes.map((prefix) => `\`${prefix} message\``).join(" o ")}\n\n` +
						"Crea una encuesta a partir de un mensaje.\n\n" +
						"Si el mensaje no contiene opciones, se añadirán las reacciones configuradas para **sí**, **no** y **duda**.\n\n" +
						"Puedes usar la opción `noshrug` para no añadir la reacción adicional.",
					inline: false,
				},

				{
					name: "Multi poll",
					value:
						`Uso: \`/poll message\`${config.prefixes.length > 0 ? " o " : ""}${config.prefixes.map((prefix) => `\`${prefix} message\``).join(" o ")}\n\n` +
						"Puedes crear una encuesta con varias opciones escribiendo una opción por línea:\n" +
						"```text\n" +
						"Título de la encuesta\n" +
						"1️⃣ Primera opción\n" +
						"2️⃣ Segunda opción\n" +
						"3️⃣ Tercera opción\n" +
						"```\n" +
						"El primer emoji de cada línea se utilizará como reacción.\n" +
						"Puedes utilizar emojis normales, emojis personalizados del servidor, números o letras.",
					inline: false,
				},

				{
					name: "Embed poll",
					value:
						"Uso: `/poll embed`\n\n" +
						"Crea una encuesta utilizando un embed.\n" +
						"Puedes configurar el color mediante un valor hexadecimal y usar `noshrug` para evitar añadir la reacción adicional.",
					inline: false,
				},

				{
					name: "Commandless mode",
					value:
						"Uso: `/commandless enabled:True [channel]`\n" +
						"Uso: `/commandless enabled:False [channel]`\n\n" +
						'Si tienes el permiso **"Gestionar canales"**, puedes hacer que todos los mensajes de un canal se conviertan automáticamente en encuestas.\n\n' +
						"Los mensajes que comiencen por 💬, 🗨️ o el emoji configurado para desactivar el modo commandless no se convertirán en encuestas.",
					inline: false,
				},

				{
					name: "Custom emoji settings",
					value:
						"Uso: `/set-emoji [channel] yes:<emoji> no:<emoji> shrug:<emoji>`\n\n" +
						'Si tienes el permiso **"Gestionar canales"**, puedes configurar los emojis utilizados en las encuestas de un canal concreto.',
					inline: false,
				},

				{
					name: "Reset channel emojis",
					value:
						"Uso: `/reset-emojis [channel]`\n\n" +
						"Elimina la configuración personalizada de emojis del canal y vuelve a utilizar la configuración por defecto del servidor.",
					inline: false,
				},

				{
					name: "Default emojis",
					value:
						"Uso: `/default-emojis yes:<emoji> no:<emoji> shrug:<emoji>`\n\n" +
						"Configura los emojis por defecto utilizados para las encuestas del servidor. Puedes usar `none` en `shrug` para desactivar la reacción adicional.",
					inline: false,
				},

				{
					name: "Configuration",

					value:
						"Uso: `/config`\n\n" +
						"Muestra toda la configuración actual del servidor, incluyendo los emojis por defecto, los canales con modo commandless activado y la configuración personalizada de emojis de cada canal.",

					inline: false,
				},

				{
					name: "Invite",
					value:
						"Uso: `/invite`\n\n" +
						"Genera un enlace para que puedas añadir Poll Reactor a otro servidor.",
					inline: false,
				},

				{
					name: "Support",
					value:
						"Uso: `/support`\n\n" +
						"Te envía por mensaje privado el enlace del servidor de soporte, si está configurado.",
					inline: false,
				},

				{
					name: "Ping",
					value: "Uso: `/ping`\n\n" + "Muestra la latencia actual del bot.",
					inline: false,
				},

				{
					name: "Help",
					value: "Uso: `/help`\n\n" + "Muestra este mensaje de ayuda.",
					inline: false,
				},
			)

			.setFooter({
				text: "Poll Reactor",
			})

			.setTimestamp();

		await interaction.reply({
			embeds: [embed],
		});
	},
};
