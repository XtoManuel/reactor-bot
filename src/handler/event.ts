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
    // Loop through each event file
    for (const file of eventFiles) {
        // Import the event file dynamically
        const { default: event } = await import(`../events/${file}`);
        const eventName = file.split(".")[0];

        if (eventName) {
            // Bind the event to the client
            client.on(eventName, event.bind(null, client));
            events.include.push(eventName);
        } else {
            events.exclude.push(eventName);
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
