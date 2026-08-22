// src/events/clientReady.ts

import { ActivityType, REST, Routes } from "discord.js";

import type { CustomClient } from "../types/CustomClient.js";

import config from "../utils/config.js";

import { migrateChannelGuilds } from "../database/poll.js";

function serializeCommandData(data: unknown): unknown {
    if (typeof data === "object" && data !== null && "toJSON" in data && typeof data.toJSON === "function") {
        return data.toJSON();
    }

    return data;
}

async function registerCommands(client: CustomClient, rest: REST): Promise<unknown> {
    const commands = Array.from(client.commands.values())
        .filter(command => command?.data)
        .map(command => ({
            name: command.name,
            data: serializeCommandData(command.data)
        }));

    try {
        return await rest.put(Routes.applicationCommands(client.user!.id), {
            body: commands.map(command => command.data)
        });
    } catch (mainError) {
        console.error("❌ Error al registrar los slash commands.");
        console.error(mainError);

        console.log("🔍 Buscando el comando que provoca el error...");

        for (const command of commands) {
            try {
                await rest.put(Routes.applicationCommands(client.user!.id), {
                    body: [command.data]
                });
            } catch (commandError) {
                console.error(`❌ Comando problemático: /${command.name}`);
                console.error(commandError);
            }
        }

        throw mainError;
    }
}

export default async function clientReady(client: CustomClient): Promise<void> {
    const startMessage = `🟢 ¡INICIADO! Iniciado como ${client.user!.username}`;

    console.log(startMessage);

    setInterval(() => {
        client.user?.setPresence({
            activities: [
                {
                    name: "/help para obtener ayuda",
                    type: ActivityType.Custom
                }
            ],

            status: "online"
        });
    }, 30000);

    try {
        if (!config.tokens.discord) {
            throw new Error("Bot token not found in config.");
        }

        console.log("🔄 Comprobando migración de canales...");

        await migrateChannelGuilds(client, client.pool);

        const rest = new REST().setToken(config.tokens.discord);

        const commands = await registerCommands(client, rest);

        console.log(`✅ Slash commands cargados: ${(commands as unknown[]).length}`);
    } catch (error) {
        console.error("❌ Error al iniciar el bot:");

        console.error(error);
    }
}
