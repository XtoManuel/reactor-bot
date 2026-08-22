// src/events/messageCreate.ts

import type { Message } from "discord.js";

import { isCommandlessChannel } from "../database/poll.js";

import { createReactionPoll } from "../services/poll.js";

import type { CustomClient } from "../types/CustomClient.js";

const COMMANDLESS_DISABLE_EMOJIS = ["💬", "🗨️", "<:pensive_speech_balloon:555620427742052365>"];

export default async function messageCreate(client: CustomClient, msg: Message) {
    // Ignorar mensajes de bots
    if (msg.author.bot) {
        return;
    }

    // Solo funcionar dentro de servidores
    if (!msg.guild) {
        return;
    }

    // Solo canales de texto
    if (!msg.channel.isTextBased()) {
        return;
    }

    // Estos emojis permiten enviar un mensaje normal
    // dentro de un canal command.
    if (COMMANDLESS_DISABLE_EMOJIS.some(emoji => msg.content.startsWith(emoji))) {
        return;
    }

    const commandless = await isCommandlessChannel(client.pool, { channelId: msg.channel.id });

    if (!commandless) {
        return;
    }

    await createReactionPoll(client, msg);
}
