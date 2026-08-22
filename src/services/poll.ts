// src/services/poll.ts

import type { Message } from "discord.js";

import { END_OF_POLL_EMOJI, getPollEmoji } from "../utils/emoji.js";

import { getDefaultPollEmoji, getPollEmoji as getChannelPollEmoji } from "../database/poll.js";

import { DEFAULT_EMOJIS } from "../config/defaults.js";

import type { CustomClient } from "../types/CustomClient.js";

export const NOSHRUG_KEYWORDS = new Set(["noshrug", "no shrug", "no🤷", "⛔shrug", "⛔ 🤷", "🚫shrug", "🚫 🤷"]);

export async function reactSafe(message: Message, reaction: string): Promise<boolean> {
    try {
        await message.react(reaction);

        return true;
    } catch {
        return false;
    }
}

interface CreateReactionPollOptions {
    shrug?: boolean;

    emojiSet?: {
        yes: string;

        no: string;

        shrug: string | null;
    };
}

export async function createReactionPoll(
    client: CustomClient,

    message: Message,

    options: CreateReactionPollOptions = {}
): Promise<void> {
    const content = message.content;

    // Si se pasa options.shrug, tiene prioridad.
    // Si no se pasa, comprobamos los keywords del mensaje.

    const shrug = options.shrug ?? ![...NOSHRUG_KEYWORDS].some(keyword => content.toLowerCase().includes(keyword));

    let emojiSet;

    // 1. Si se proporcionan emojis manualmente mediante options,
    // tienen máxima prioridad.

    if (options.emojiSet) {
        emojiSet = options.emojiSet;
    } else {
        // 2. Intentamos obtener los emojis específicos del canal.

        const channelEmoji = await getChannelPollEmoji(client.pool, {
            channelId: message.channel.id
        });

        // 3. Si no hay configuración en el canal, usamos
        // los emojis por defecto del servidor.

        const guildEmoji =
            !channelEmoji && message.guildId ? await getDefaultPollEmoji(client.pool, { guildId: message.guildId }) : null;

        // 4. Prioridad:
        //
        // Canal
        //   ↓
        // Servidor
        //   ↓
        // Bot

        const selectedEmoji = channelEmoji ?? guildEmoji ?? DEFAULT_EMOJIS;

        // yes y no siempre existen.
        // shrug puede ser null.

        emojiSet = {
            yes: selectedEmoji.yes,
            no: selectedEmoji.no,
            shrug: selectedEmoji.shrug ?? null
        };
    }

    const seenReactions = new Set<string>();

    for (const reaction of getPollEmoji(content, {
        shrug,

        emojiSet
    })) {
        if (reaction === END_OF_POLL_EMOJI) {
            // No hubo ninguna reacción válida.

            if (seenReactions.size === 0) {
                return;
            }

            continue;
        }

        if (typeof reaction !== "string") {
            continue;
        }

        if (seenReactions.has(reaction)) {
            continue;
        }

        if (await reactSafe(message, reaction)) {
            seenReactions.add(reaction);
        }
    }
}
