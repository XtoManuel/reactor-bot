// src/database/init.ts

import { readFile } from "node:fs/promises";

import { resolve } from "node:path";

import type { Pool } from "pg";

export async function initializeDatabase(pool: Pool): Promise<void> {
    const schemaPath = resolve(process.cwd(), "data", "schema.sql");

    const schema = await readFile(schemaPath, "utf8");

    await pool.query(schema);

    console.log("✅ Base de datos inicializada correctamente.");
}
