// src/utils/config.ts

import { existsSync, readFileSync } from "node:fs";

import { resolve } from "node:path";
import { Config } from "../types/Config";

const configPath = resolve(process.cwd(), "data", "config.json");

if (!existsSync(configPath)) {
    throw new Error(`❌ No se encontró el archivo de configuración: ${configPath}`);
}

let config: Config;

try {
    const file = readFileSync(configPath, "utf8");

    config = JSON.parse(file) as Config;
} catch (error) {
    throw new Error(`❌ No se pudo leer o analizar data/config.json: ${error instanceof Error ? error.message : String(error)}`);
}

export default config;
