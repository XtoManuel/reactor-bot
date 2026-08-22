interface DatabaseConfig {
    user: string;
    password: string;
    database: string;
    host: string;
    port?: number;
}

export interface Config {
    release: string;

    description: string;

    prefixes: string[];

    support_server_invite_code: string;

    database: DatabaseConfig;

    tokens: {
        discord: string;

        stats: {
            "bots.discord.pw": string | null;
            "discordbots.org": string | null;
        };
    };

    success_or_failure_emojis: {
        False: string;
        True: string;
    };
}
