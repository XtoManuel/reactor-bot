// src/services/poll.ts

import type { Message } from "discord.js";

import { END_OF_POLL_EMOJI, getPollEmoji } from "../utils/emoji.js";

import {
	getDefaultPollEmoji,
	getPollEmoji as getChannelPollEmoji,
} from "../database/poll.js";

import { DEFAULT_EMOJIS } from "../config/defaults.js";

import type { CustomClient } from "../types/CustomClient.js";

export const NOSHRUG_KEYWORDS = new Set([
	"noshrug",
	"no shrug",
	"no🤷",
	"⛔shrug",
	"⛔ 🤷",
	"🚫shrug",
	"🚫 🤷",
]);

export async function reactSafe(
	message: Message,
	reaction: string,
): Promise<boolean> {
	try {
		await message.react(reaction);

		return true;
	} catch (error) {
		console.error(
			`❌ No se pudo añadir la reacción ${reaction} al mensaje ${message.id}:`,
			error,
		);

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

	analysisContent?: string;
}

export async function createReactionPoll(
	client: CustomClient,
	message: Message,
	options: CreateReactionPollOptions = {},
): Promise<void> {
	try {
		const content = options.analysisContent ?? message.content;

		const shrug =
			options.shrug ??
			![...NOSHRUG_KEYWORDS].some((keyword) =>
				content.toLowerCase().includes(keyword),
			);

		let emojiSet;

		// 1. Emojis proporcionados manualmente
		if (options.emojiSet) {
			emojiSet = options.emojiSet;
		} else {
			// 2. Configuración específica del canal
			const channelEmoji = await getChannelPollEmoji(client.pool, {
				channelId: message.channel.id,
			});

			// 3. Configuración del servidor
			const guildEmoji =
				!channelEmoji && message.guildId
					? await getDefaultPollEmoji(client.pool, {
							guildId: message.guildId,
						})
					: null;

			// 4. Canal → Servidor → Global
			const selectedEmoji = channelEmoji ?? guildEmoji ?? DEFAULT_EMOJIS;

			emojiSet = {
				yes: selectedEmoji.yes,

				no: selectedEmoji.no,

				shrug: selectedEmoji.shrug ?? null,
			};
		}

		const seenReactions = new Set<string>();

		const addReaction = async (reaction: string) => {
			if (seenReactions.has(reaction)) {
				return;
			}

			if (await reactSafe(message, reaction)) {
				seenReactions.add(reaction);
			}
		};

		/*
		 * Encuestas detectadas automáticamente desde el contenido.
		 */
		for (const reaction of getPollEmoji(content, {
			shrug,

			emojiSet,
		})) {
			if (reaction === END_OF_POLL_EMOJI) {
				if (seenReactions.size === 0) {
					return;
				}

				continue;
			}

			if (typeof reaction !== "string") {
				continue;
			}

			await addReaction(reaction);
		}
	} catch (error: any) {
		console.error("[ERROR] Error al añadir las reacciones", error.msg);
	}
}
