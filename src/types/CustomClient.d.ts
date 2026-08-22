import { Client } from "discord.js";
import type { Pool } from "pg";

export interface CustomClient extends Client {
    commands: Map<string, any>;
    events: Map<string, any>;
    pool: Pool;
}
