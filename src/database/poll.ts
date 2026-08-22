// src/database/poll.ts

import type { Pool } from "pg";

import { convertShortcode } from "../utils/emoji.js";

export interface PollEmoji {
    yes: string;

    no: string;

    shrug: string | null;
}

export interface ChannelOptions {
    channelId: string;
}

export interface SetPollEmojiOptions {
    channelId: string;

    yes: string;

    no: string;

    shrug: string | null;
}

export async function setPollEmoji(pool: Pool, options: SetPollEmojiOptions): Promise<void> {
    const { channelId, yes, no, shrug } = options;

    const convertedYes = convertShortcode(yes);

    const convertedNo = convertShortcode(no);

    const convertedShrug = !shrug || shrug.toLowerCase() === "none" ? null : convertShortcode(shrug);

    await pool.query(
        `
        INSERT INTO poll_emoji (
            channel,
            yes,
            no,
            shrug
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (channel)
        DO UPDATE SET
            yes = EXCLUDED.yes,
            no = EXCLUDED.no,
            shrug = EXCLUDED.shrug
        `,
        [channelId, convertedYes, convertedNo, convertedShrug]
    );
}

export async function getPollEmoji(pool: Pool, options: ChannelOptions): Promise<PollEmoji | null> {
    const { channelId } = options;

    const result = await pool.query<PollEmoji>(
        `
        SELECT
            yes,
            no,
            shrug
        FROM poll_emoji
        WHERE channel = $1
        `,
        [channelId]
    );

    return result.rows[0] ?? null;
}

export async function setCommandlessChannel(pool: Pool, options: ChannelOptions): Promise<void> {
    const { channelId } = options;

    await pool.query(
        `
        INSERT INTO commandless_channels (
            channel
        )
        VALUES ($1)
        ON CONFLICT DO NOTHING
        `,
        [channelId]
    );
}

export async function unsetCommandlessChannel(pool: Pool, options: ChannelOptions): Promise<void> {
    const { channelId } = options;

    await pool.query(
        `
        DELETE FROM commandless_channels
        WHERE channel = $1
        `,
        [channelId]
    );
}

export async function isCommandlessChannel(pool: Pool, options: ChannelOptions): Promise<boolean> {
    const { channelId } = options;

    const result = await pool.query(
        `
        SELECT 1
        FROM commandless_channels
        WHERE channel = $1
        `,
        [channelId]
    );

    return result.rowCount !== 0;
}

export async function setDefaultPollEmoji(
    pool: Pool,
    guildId: string,
    yes: string,
    no: string,
    shrug?: string | null
): Promise<void> {
    const emojis = [convertShortcode(yes), convertShortcode(no), shrug ? convertShortcode(shrug) : null];

    await pool.query(
        `
        INSERT INTO guild_poll_emoji (
            guild,
            yes,
            no,
            shrug
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (guild)
        DO UPDATE SET
            yes = EXCLUDED.yes,
            no = EXCLUDED.no,
            shrug = EXCLUDED.shrug
        `,
        [guildId, emojis[0], emojis[1], emojis[2]]
    );
}

export async function getDefaultPollEmoji(pool: Pool, options: { guildId: string }): Promise<PollEmoji | null> {
    const result = await pool.query<PollEmoji>(
        `
        SELECT
            yes,
            no,
            shrug
        FROM guild_poll_emoji
        WHERE guild = $1
        `,
        [options.guildId]
    );

    return result.rows[0] ?? null;
}

export async function resetPollEmoji(pool: Pool, options: { channelId: string }): Promise<void> {
    await pool.query(
        `
        DELETE FROM poll_emoji
        WHERE channel = $1
        `,
        [options.channelId]
    );
}

export async function getCommandlessChannels(pool: Pool, options: { guildId: string }): Promise<{ channelId: string }[]> {
    const result = await pool.query<{
        channel_id: string;
    }>(
        `
        SELECT channel_id
        FROM commandless_channels
        WHERE guild_id = $1
        ORDER BY channel_id
    `,
        [options.guildId]
    );

    return result.rows.map(row => ({
        channelId: row.channel_id
    }));
}
