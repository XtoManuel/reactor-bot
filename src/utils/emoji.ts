// src/utils/emoji.ts

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_EMOJIS } from "../config/defaults.js";

export const ASCII_LETTERS = new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");

export const ASCII_DIGITS = new Set("0123456789");

// Indica el final de los emoji de la encuesta
// y el comienzo del shrug / easter eggs.
export const END_OF_POLL_EMOJI = Symbol("END_OF_POLL_EMOJI");

export type PollEmoji = string | typeof END_OF_POLL_EMOJI;

interface DiscordEmoji {
    names: string[];
    surrogates: string;
}

type DiscordEmojiShortcodes = Record<string, DiscordEmoji[]>;

function getShortcodes(): Map<string, string> {
    const filePath = resolve(process.cwd(), "data", "discord-emoji-shortcodes.json");

    const data = readFileSync(filePath, "utf8");

    const shortcodes: DiscordEmojiShortcodes = JSON.parse(data);

    const flattenedShortcodes = new Map<string, string>();

    for (const emojis of Object.values(shortcodes)) {
        for (const emoji of emojis) {
            for (const name of emoji.names) {
                flattenedShortcodes.set(name.toLowerCase(), emoji.surrogates);
            }
        }
    }

    return flattenedShortcodes;
}

export const SHORTCODES = getShortcodes();

export function convertShortcode(emoji: string): string {
    const shortcode = emoji.trim().replace(/^:/, "").replace(/:$/, "").toLowerCase();

    return SHORTCODES.get(shortcode) ?? emoji;
}

// src/utils/emoji.ts

export function* getPollEmoji(
    message: string,
    options: {
        shrug?: boolean;
        emojiSet?: {
            yes: string;
            no: string;
            shrug: string | null;
        };
    } = {}
): Generator<PollEmoji> {
    const { shrug = true, emojiSet = DEFAULT_EMOJIS } = options;

    // Ignorar la primera línea.
    // Máximo 19 líneas si usamos shrug.
    // Máximo 20 si no lo usamos.
    const lines = message
        .split("\n")
        .slice(1, 21 - Number(shrug))
        .map(line => line.trim())
        .filter(Boolean);

    // Si hay opciones, usar los emojis escritos
    // al comienzo de cada línea.
    if (lines.length > 0) {
        for (const line of lines) {
            yield parseStartingEmoji(line);
        }
    } else {
        // Si no hay opciones, usar los emojis
        // configurados para el canal/servidor.
        yield emojiSet.yes;
        yield emojiSet.no;
    }

    // Marca el final de las opciones principales.
    yield END_OF_POLL_EMOJI;

    // Añadir shrug después de las opciones.
    if (shrug && emojiSet.shrug) {
        yield emojiSet.shrug;
    }

    const easterEggEmoji = getEasterEggEmoji();

    if (easterEggEmoji !== undefined) {
        yield easterEggEmoji;
    }
}

export function parseStartingEmoji(line: string): string {
    return parseEmoji(extractEmoji(line));
}

export function extractEmoji(line: string): string {
    const beforeParenthesis = line.split(")")[0];

    const firstWord = beforeParenthesis.trim().split(/\s+/)[0];

    return firstWord ?? "";
}

export function parseEmoji(text: string): string {
    const trimmed = text.trim();

    // Emoji personalizado del servidor.
    const customEmojiMatch = /^<(a?:\w+:\d+)>$/u.exec(trimmed);

    if (customEmojiMatch) {
        return customEmojiMatch[1];
    }

    // Shortcodes como :one:, :two:, :smile:, etc.
    if (/^:[\w+-]+:$/u.test(trimmed)) {
        return convertShortcode(trimmed);
    }

    if (ASCII_LETTERS.has(trimmed)) {
        return getLetterEmoji(trimmed.toUpperCase());
    }

    if (ASCII_DIGITS.has(trimmed)) {
        return getDigitEmoji(trimmed);
    }

    return trimmed;
}

export function getLetterEmoji(letter: string): string {
    const [month, day] = getDate();

    if (letter === "B" && month === 4 && day === 1) {
        return "🅱";
    }

    const regionalIndicatorStart = 0x1f1e6;

    const letterIndex = letter.charCodeAt(0) - "A".charCodeAt(0);

    return String.fromCodePoint(regionalIndicatorStart + letterIndex);
}

export function getDigitEmoji(digit: string): string {
    return `${digit}\u20E3`;
}

export function getEasterEggEmoji(): string | undefined {
    const [month, day] = getDate();

    const easterEggs = new Map<string, readonly string[]>([
        ["4-1", ["🦑", "🐙"]],
        ["5-9", [":fsociety:376935242029727745"]],
        ["10-31", ["🎃", "👻"]]
    ]);

    const emojis = easterEggs.get(`${month}-${day}`);

    if (!emojis) {
        return undefined;
    }

    return emojis[Math.floor(Math.random() * emojis.length)];
}

export function getDate(): [month: number, day: number] {
    const today = new Date();

    return [today.getUTCMonth() + 1, today.getUTCDate()];
}
