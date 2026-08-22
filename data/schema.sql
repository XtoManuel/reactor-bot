-- Migración de prefixless_channels a commandless_channels
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'prefixless_channels'
    )
    AND NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'commandless_channels'
    ) THEN

        ALTER TABLE prefixless_channels
        RENAME TO commandless_channels;

    END IF;
END $$;


CREATE TABLE IF NOT EXISTS commandless_channels (
    channel BIGINT PRIMARY KEY NOT NULL,
    guild BIGINT
);


CREATE TABLE IF NOT EXISTS poll_emoji (
    channel BIGINT PRIMARY KEY NOT NULL,
    guild BIGINT,
    yes TEXT NOT NULL,
    no TEXT NOT NULL,
    shrug TEXT
);


CREATE TABLE IF NOT EXISTS default_poll_emoji (
    guild BIGINT PRIMARY KEY NOT NULL,
    yes TEXT NOT NULL,
    no TEXT NOT NULL,
    shrug TEXT
);


-- Compatibilidad con bases de datos existentes

ALTER TABLE commandless_channels
ADD COLUMN IF NOT EXISTS guild BIGINT;

ALTER TABLE poll_emoji
ADD COLUMN IF NOT EXISTS guild BIGINT;


-- Compatibilidad con bases de datos antiguas

ALTER TABLE poll_emoji
ALTER COLUMN shrug DROP NOT NULL;
