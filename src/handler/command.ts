import { readdirSync } from "node:fs";
import { sleep } from "../utils/utils.js";
import { CustomClient } from "../types/CustomClient.js";

const commands: { all: number; include: string[]; exclude: string[] } = { all: 0, include: [], exclude: [] };

/**
 * Loads commands from the "./commands/" directory and sets them in the client.
 * @param {CustomClient} client - The client object.
 */
export default async function loadCommands(client: CustomClient) {
    // Get all the files in the "./dist/src/commands/" directory that end with ".js"
    const commandsFiles = readdirSync("./dist/src/commands/").filter(file => !file.startsWith(".") && file.endsWith(".js"));

    // Set the total number of commands
    commands.all = commandsFiles.length;

    // Iterate over each command file
    for (const file of commandsFiles) {
        // Import the command file dynamically
        const { command } = await import(`../commands/${file}`);
        const commandName = file.split(".")[0];

        // Check if the command file has a valid name
        if (commandName && command.name) {
            // Set the command in the client's commands collection
            if (command?.data) {
                client.commands.set(command.name, {
                    ...command,
                    data: command.data.toJSON()
                });
            } else {
                client.commands.set(command.name, command);
            }

            // Add the command name to the include list
            commands.include.push(command.name);
        } else {
            // Add the command name to the exclude list
            commands.exclude.push(commandName);
        }
    }

    // Log the success message
    const successMessage = `\`✅\` Comandos cargados: \`${commands.include.length}\` / \`${commands.all}\``;

    // Remove backticks from the success message and log it
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

    // Check if all commands were successfully loaded
    if (commands.include.length !== commands.all) {
        // Log the error message
        const errorMessage = `\`❌\` Error en los siguientes comandos: \`${commands.exclude}\``;
        console.error(errorMessage.replaceAll("`", ""));
    }

    // Wait for 5 seconds
    await sleep(5000);

    // Check if any commands failed to load
    if (commands.all !== commands.include.length + commands.exclude.length) {
        // Log the error message
        const errorMessage = `\`❌\` No se han podido cargar ${commands.all - commands.include.length - commands.exclude.length} comandos.`;
        console.error(errorMessage.replaceAll("`", ""));
    }
}
