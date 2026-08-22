// tests/emoji.test.ts

import { describe, expect, it, vi, afterEach } from "vitest";

import * as emoji from "../src/utils/emoji.js";

const NON_HOLIDAY = new Date("2017-03-27T12:00:00");

const APRIL_FOOLS = new Date("2017-04-01T12:00:00");

const FIVE_NINE = new Date("2017-05-09T12:00:00");

const HALLOWEEN = new Date("2017-10-31T12:00:00");

const EASTER_EGG_EMOJI = new Map([
    [APRIL_FOOLS, new Set(["🦑", "🐙"])],
    [FIVE_NINE, new Set([":fsociety:376935242029727745"])],
    [HALLOWEEN, new Set(["🎃", "👻"])]
]);

afterEach(() => {
    vi.useRealTimers();
});

describe("emoji utils", () => {
    it("getPollEmoji", () => {
        const messages = new Map<string, string[]>([
            [
                [
                    "/ What should we eat for lunch?",
                    "M)-ystery meat",
                    "🐕 dog sandwiches",
                    "",
                    "3 blind mice",
                    "🇺🇸) flags",
                    "foo",
                    "bar"
                ].join("\n"),

                ["🇲", "🐕", "3⃣", "🇺🇸", "foo", "bar"]
            ],

            ["/ Haskell lang best lang?", ["👍", "👎"]]
        ]);

        for (const [date, easterEggEmoji] of EASTER_EGG_EMOJI) {
            vi.useFakeTimers();

            vi.setSystemTime(date);

            for (const [message, reactions] of messages) {
                const pollEmoji = [...emoji.getPollEmoji(message)];

                const endIndex = pollEmoji.indexOf(emoji.END_OF_POLL_EMOJI);

                expect(endIndex).not.toBe(-1);

                // Todo lo anterior al marcador debe ser string.
                const pollReactions = pollEmoji
                    .slice(0, endIndex)
                    .filter((reaction): reaction is string => typeof reaction === "string");

                expect(pollReactions).toEqual(reactions);

                // Después del marcador está 🤷 y después
                // el easter egg.
                const afterEnd = pollEmoji
                    .slice(endIndex + 1)
                    .filter((reaction): reaction is string => typeof reaction === "string");

                expect(afterEnd[0]).toBe("🤷");

                const easterEgg = afterEnd.at(-1);

                expect(easterEgg).toBeDefined();

                expect(easterEggEmoji.has(easterEgg!)).toBe(true);
            }
        }
    });

    it("extractEmoji", () => {
        const linesAndEmojis: Record<string, string> = {
            " M)-ystery meat": "M",

            "🐕 dog sandwiches": "🐕",

            "3 blind mice": "3",

            "🇺🇸 flags": "🇺🇸",

            "<:python3:232720527448342530> python3!": "<:python3:232720527448342530>"
        };

        for (const [input, output] of Object.entries(linesAndEmojis)) {
            expect(emoji.extractEmoji(input)).toBe(output);
        }
    });

    it("parseEmoji", () => {
        const ioMap: Record<string, string> = {
            "<:python3:232720527448342530>": ":python3:232720527448342530",

            a: "🇦",

            "0": "0⃣",

            "6": "6⃣",

            "asdfghjkl;": "asdfghjkl;"
        };

        for (const [input, output] of Object.entries(ioMap)) {
            expect(emoji.parseEmoji(input)).toBe(output);
        }
    });

    it("getLetterEmoji", () => {
        const ioMap: Record<string, string> = {
            A: "🇦",
            B: "🇧",
            C: "🇨",
            D: "🇩",
            E: "🇪",
            F: "🇫",
            G: "🇬",
            H: "🇭",
            I: "🇮",
            J: "🇯",
            K: "🇰",
            L: "🇱",
            M: "🇲",
            N: "🇳",
            O: "🇴",
            P: "🇵",
            Q: "🇶",
            R: "🇷",
            S: "🇸",
            T: "🇹",
            U: "🇺",
            V: "🇼",
            W: "🇼",
            X: "🇽",
            Y: "🇾",
            Z: "🇿"
        };

        vi.useFakeTimers();

        vi.setSystemTime(NON_HOLIDAY);

        for (const [input, output] of Object.entries(ioMap)) {
            expect(emoji.getLetterEmoji(input)).toBe(output);
        }

        vi.setSystemTime(APRIL_FOOLS);

        expect(emoji.getLetterEmoji("B")).toBe("🅱");
    });

    it("getDigitEmoji", () => {
        const ioMap: Record<string, string> = {
            "0": "0⃣",
            "1": "1⃣",
            "2": "2⃣",
            "3": "3⃣",
            "4": "4⃣",
            "5": "5⃣",
            "6": "6⃣",
            "7": "7⃣",
            "8": "8⃣",
            "9": "9⃣"
        };

        for (const [input, output] of Object.entries(ioMap)) {
            expect(emoji.getDigitEmoji(input)).toBe(output);
        }
    });

    it("getEasterEggEmoji", () => {
        for (const [date, easterEggEmoji] of EASTER_EGG_EMOJI) {
            vi.useFakeTimers();

            vi.setSystemTime(date);

            const responses = new Set<string>();

            for (let i = 0; i < 100; i++) {
                const response = emoji.getEasterEggEmoji();

                if (response !== undefined) {
                    responses.add(response);
                }
            }

            expect(responses.size).toBe(easterEggEmoji.size);

            expect([...easterEggEmoji].every(item => responses.has(item))).toBe(true);
        }
    });
});
