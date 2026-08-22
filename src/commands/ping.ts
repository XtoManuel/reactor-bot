import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { commands } from "../data/dictionary.js";

export const command = {
    name: "ping",
    data: new SlashCommandBuilder().setName("ping").setDescription(commands?.ping?.desc || "N/A"),

    /**
     * Runs the function to record the current time, acknowledge the interaction, calculate the ping, and display the ping results.
     *
     * @param {ChatInputCommandInteraction} interaction - The interaction object
     * @return {Promise<void>} A promise that resolves when the function completes
     */
    async run(interaction: ChatInputCommandInteraction) {
        // Record the current time
        const time = Date.now();

        // Send an ephemeral reply to acknowledge the interaction
        await interaction.reply({
            // content: "** **",
            content: "Cargando..." // Mensaje temporal
        });

        // Calculate the ping by subtracting the recorded time from the current time
        const ping = Date.now() - time;

        // Create an embed message to display the ping results
        const embed = new EmbedBuilder()
            .setTitle("Ping:")
            .setColor(15132390) // Asegúrate de que este color sea el deseado
            .setDescription(`📡 **API:** \`${interaction.client.ws.ping}\` **ms**\n🤖 **Bot:** \`${ping}\` **ms**`);

        try {
            // Edit the original reply with the embed message
            await interaction.editReply({ content: "", embeds: [embed] });
        } catch (error: any) {
            console.error("Error al editar la respuesta:", error.stack);
            await interaction.followUp({
                content: "❌ Ocurrió un error al obtener el ping.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
