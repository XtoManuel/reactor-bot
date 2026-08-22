// index.ts

import dotenv from "dotenv";

dotenv.config();

import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";

import commandHandler from "./src/handler/command.js";

import eventHandler from "./src/handler/event.js";

import pool from "./src/database/client.js";

import { initializeDatabase } from "./src/database/init.js";

import { CustomClient } from "./src/types/CustomClient.js";

import config from "./src/utils/config.js";

const client = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],

    partials: [Partials.GuildMember, Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
}) as CustomClient;

(async () => {
    client.events = new Collection();

    client.commands = new Collection();

    // Asignar PostgreSQL al cliente
    client.pool = pool;

    // Comprobar la conexión
    await client.pool.query("SELECT 1");

    // Ejecutar schema.sql y migraciones
    await initializeDatabase(client.pool);

    // Cargar eventos y comandos
    await Promise.all([eventHandler, commandHandler].map(handler => handler(client)));

    await client.login(config.tokens.discord);
})().catch(error => {
    console.error("Error al iniciar el bot:", error);

    process.exit(1);
});
