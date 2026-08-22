import { ActivityType, REST, Routes } from "discord.js";
import { CustomClient } from "../types/CustomClient.js";

/**
 * Asynchronous function that initializes the client, sets presence, loads slash commands, and handles errors.
 *
 * @param {CustomClient} client - The client object
 * @return {Promise<void>} A promise that resolves when the function completes
 */
export default async function clientReady(client: CustomClient): Promise<void> {
    // Log startup message and send logs
    const startMessage = `\`🟢\` ¡INICIADO! Iniciado como ${client.user!.username}`;
    console.log(startMessage.replaceAll("`", ""));

    // Set bot presence every 30 seconds (adjust based on your needs)
    setInterval(() => {
        client.user?.setPresence({
            activities: [
                {
                    name: "que se portan bien",
                    type: ActivityType.Watching
                }
            ],
            status: "online"
        });
    }, 30000); // Adjusted to 30 seconds

    try {
        // Ensure the token is available before making the REST call
        if (!process.env.TOKEN) {
            throw new Error("Bot token not found in environment variables.");
        }

        // Register slash commands
        const rest = new REST().setToken(process.env.TOKEN);
        const parsedCommands = Array.from(client.commands.values())
            .filter(cmd => cmd?.data)
            .map(command => command.data);
        const commands = await rest.put(Routes.applicationCommands(client.user!.id), { body: parsedCommands });

        // Log success message
        const successMessage = `\`✅\` Slash commands cargados: \`${(commands as Array<unknown>).length}\``;
        console.log(successMessage.replaceAll("`", ""));
    } catch (error) {
        // Log error message
        const errorMessage = `\`❌\`	Error al cargar los slash commands:\n\`${error}\``;
        console.error(errorMessage.replaceAll("`", ""));
    }
}
