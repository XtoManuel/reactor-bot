// src/handler/event.ts

import { readdirSync } from "node:fs";

import { sleep } from "../utils/utils.js";
import { CustomClient } from "../types/CustomClient.js";

const events: {
    all: number;
    include: string[];
    exclude: string[];
} = {
    all: 0,
    include: [],
    exclude: []
};

/**
 * Loads all events and binds them to the client.
 *
 * @param client - The Discord client.
 */
export default async function loadEvents(client: CustomClient): Promise<void> {
    const eventFiles = readdirSync("./dist/src/events/").filter(file => !file.startsWith(".") && file.endsWith(".js"));

    events.all = eventFiles.length;

    // Loop through each event file
    for (const file of eventFiles) {
        try {
            console.log(`🔄 Cargando evento: ${file}`);

            const module = await import(`../events/${file}`);
            const event = module.default;

            const eventName = file.split(".")[0];

            console.log({
                file,
                eventName,
                eventType: typeof event,
                event
            });

            if (typeof event !== "function") {
                throw new TypeError(`El evento "${file}" no exporta una función por defecto. Tipo recibido: ${typeof event}`);
            }

            if (eventName) {
                client.on(eventName, event.bind(null, client));

                events.include.push(eventName);

                console.log(`✅ Evento cargado: ${eventName}`);
            } else {
                events.exclude.push(file);
            }
        } catch (error) {
            console.error(`❌ Error cargando el evento: ${file}`, error);

            events.exclude.push(file);
        }
    }

    // Log the success message without backticks
    const successMessage = `\`✅\` Eventos cargados: \`${events.include.length}\` / \`${events.all}\``;
    console.log(successMessage.replaceAll("`", ""));

    // // Check if the client user exists
    // if (client.user) {
    //     // Send the success message to the logs
    //     sendLogs(client, successMessage);
    // } else {
    //     // Wait for 5 seconds and try again if sending logs fails
    //     await sleep(5000);
    //     sendLogs(client, successMessage);
    // }

    // Check if there are any events that were not loaded
    if (events.include.length !== events.all) {
        const errorMessage = `\`❌\` Eventos no cargados: \`${events.exclude}\``;
        console.error(errorMessage.replaceAll("`", ""));
    }

    // Wait for 5 seconds
    await sleep(5000);

    // Check if all the events were loaded successfully
    if (events.all !== events.include.length + events.exclude.length) {
        const errorMessage = `\`❌\` No se han podido cargar ${events.all - events.include.length - events.exclude.length} eventos.`;
        console.error(errorMessage.replaceAll("`", ""));
    }
}
