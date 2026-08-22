// src/events/messageCreate.ts

import type { Message } from "discord.js";

import { isCommandlessChannel } from "../database/poll.js";

import { createReactionPoll } from "../services/poll.js";

import type { CustomClient } from "../types/CustomClient.js";

const COMMANDLESS_DISABLE_EMOJIS = ["💬", "🗨️", "<:pensive_speech_balloon:555620427742052365>"];

export default async function createMessage(message: Message) {
    // Ignorar mensajes de bots
    if (message.author.bot) {
        return;
    }

    // Solo funcionar dentro de servidores
    if (!message.guild) {
        return;
    }

    // Solo canales de texto
    if (!message.channel.isTextBased()) {
        return;
    }

    const client = message.client as CustomClient;

    // Estos emojis permiten enviar un mensaje normal
    // dentro de un canal command.
    if (COMMANDLESS_DISABLE_EMOJIS.some(emoji => message.content.startsWith(emoji))) {
        return;
    }

    const commandless = await isCommandlessChannel(client.pool, { channelId: message.channel.id });

    if (!commandless) {
        return;
    }

    await createReactionPoll(client, message);
}
