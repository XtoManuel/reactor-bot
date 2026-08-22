// src/database/poll.ts

import type { Pool } from "pg";

import { convertShortcode } from "../utils/emoji.js";
import { CustomClient } from "../types/CustomClient.js";

export interface PollEmoji {
    yes: string;
    no: string;
    shrug: string | null;
}

export interface ChannelOptions {
    channelId: string;
}

export type GuildChannelOptions = ChannelOptions & {
    guildId: string;
};

export type SetPollEmojiOptions = GuildChannelOptions & PollEmoji;

export async function setPollEmoji(pool: Pool, options: SetPollEmojiOptions): Promise<void> {
    const { channelId, guildId, yes, no, shrug } = options;

    const convertedYes = convertShortcode(yes);

    const convertedNo = convertShortcode(no);

    const convertedShrug = !shrug || shrug.toLowerCase() === "none" ? null : convertShortcode(shrug);

    await pool.query(
        `
            INSERT INTO poll_emoji (
                channel,
                guild,
                yes,
                no,
                shrug
            )
            VALUES ($1, $2, $3, $4, $5)

            ON CONFLICT (channel)
            DO UPDATE SET
                guild = EXCLUDED.guild,
                yes = EXCLUDED.yes,
                no = EXCLUDED.no,
                shrug = EXCLUDED.shrug
        `,
        [channelId, guildId, convertedYes, convertedNo, convertedShrug]
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

export async function setCommandlessChannel(pool: Pool, options: GuildChannelOptions): Promise<void> {
    const { channelId, guildId } = options;

    await pool.query(
        `
            INSERT INTO commandless_channels (
                channel,
                guild
            )
            VALUES ($1, $2)

            ON CONFLICT (channel)
            DO UPDATE SET
                guild = EXCLUDED.guild
        `,
        [channelId, guildId]
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
    const convertedYes = convertShortcode(yes);

    const convertedNo = convertShortcode(no);

    const convertedShrug = !shrug || shrug.toLowerCase() === "none" ? null : convertShortcode(shrug);

    await pool.query(
        `
            INSERT INTO default_poll_emoji (
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
        [guildId, convertedYes, convertedNo, convertedShrug]
    );
}

export async function getDefaultPollEmoji(pool: Pool, options: { guildId: string }): Promise<PollEmoji | null> {
    const result = await pool.query<PollEmoji>(
        `
            SELECT
                yes,
                no,
                shrug
            FROM default_poll_emoji
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
        channel: string;
    }>(
        `
            SELECT channel
            FROM commandless_channels
            WHERE guild = $1
            ORDER BY channel
        `,
        [options.guildId]
    );

    return result.rows.map(row => ({
        channelId: row.channel
    }));
}

export async function migrateChannelGuilds(client: CustomClient, pool: Pool): Promise<void> {
    const tables = ["commandless_channels", "poll_emoji"] as const;

    for (const table of tables) {
        const result = await pool.query<{
            channel: string;
        }>(`
            SELECT channel
            FROM ${table}
            WHERE guild IS NULL
        `);

        for (const row of result.rows) {
            try {
                const channel = await client.channels.fetch(row.channel);

                if (!channel || !("guild" in channel)) {
                    console.warn(`⚠️ No se pudo obtener un servidor para el canal ${row.channel}.`);

                    continue;
                }

                await pool.query(
                    `
                        UPDATE ${table}
                        SET guild = $1
                        WHERE channel = $2
                    `,
                    [channel.guild.id, row.channel]
                );

                console.log(`✅ Canal ${row.channel} migrado al servidor ${channel.guild.id}.`);
            } catch (error) {
                console.error(`❌ Error migrando el canal ${row.channel} en ${table}:`, error);
            }
        }
    }

    console.log("✅ Migración de servidores de canales completada.");
}

export async function getPollEmojiChannels(
    pool: Pool,
    options: { guildId: string }
): Promise<{ channelId: string; emojis: PollEmoji }[]> {
    const result = await pool.query<{
        channel: string;
        yes: string;
        no: string;
        shrug: string | null;
    }>(
        `
            SELECT
                channel,
                yes,
                no,
                shrug
            FROM poll_emoji
            WHERE guild = $1
            ORDER BY channel
        `,
        [options.guildId]
    );

    return result.rows.map(row => ({
        channelId: row.channel,
        emojis: {
            yes: row.yes,
            no: row.no,
            shrug: row.shrug
        }
    }));
}
