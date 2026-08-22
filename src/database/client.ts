// src/database/client.ts

import { Pool } from "pg";

import config from "../utils/config.js";

const pool = new Pool({
    user: config.database.user,

    password: config.database.password,

    database: config.database.database,

    host: config.database.host,

    port: config.database.port ?? 5432
});

export default pool;
