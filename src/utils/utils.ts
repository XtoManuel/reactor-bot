/* Este código busca en los roles del usuario si tiene una cantidad determinada de roles que se encuentran el array = ['rolID'], si lo tiene manda true y si no lo tiene manda false
    msg.member.roles.cache.filter((role) => array.includes(role.id)).size < 1
    */

// SLEEP
export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// QUITAR ACENTOS

export function normalText(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, "");
}

/**
 * Replaces placeholders in the content with corresponding values.
 *
 * @param {string} content - The original content with placeholders.
 * @param {Object} args - Key-value pairs for replacing placeholders.
 * @returns {string} The content with placeholders replaced by values.
 */
export function replaceContent(content: string, args: Record<string, any>): string {
    if (!content) return content;

    return Object.entries(args).reduce((result, [key, value]) => {
        const regex = new RegExp(`{${key}}`, "g");
        return result.replace(regex, value);
    }, content);
}

/**
 * Escapes special markdown characters in the given text.
 *
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
export function escapeMarkdown(text: string) {
    const specialChars = new Set(["*", "_", "~", "`", "|", ">", "#", "+", "-", "=", "{", "}", "(", ")", "[", "]", ".", "!"]);
    return text
        .split("")
        .map(char => (specialChars.has(char) ? `\\${char}` : char))
        .join("");
}
