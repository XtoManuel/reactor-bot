// config/commands.ts

export const commands = {
    "default-emojis": {
        desc: "Configura los emojis por defecto del servidor.",

        opts: {
            yes: "Emoji para la opción positiva.",
            no: "Emoji para la opción negativa.",
            shrug: 'Emoji adicional. Usa "none" para desactivarlo.'
        }
    },
    invite: {
        desc: "Obtén un enlace para invitar al bot."
    },
    ping: {
        desc: "Obtener la latencia del Bot."
    },
    poll: {
        desc: "Crea una encuesta.",

        subcommands: {
            message: {
                desc: "Crea una encuesta mediante un mensaje.",
                opts: {
                    noshrug: "No añadir la reacción 🤷."
                }
            },
            embed: {
                desc: "Crea una encuesta mediante un embed.",
                opts: {
                    color: "Color del embed en formato hexadecimal.",
                    noshrug: "No añadir la reacción 🤷."
                }
            }
        }
    },
    commandless: {
        desc: "Activa o desactiva las encuestas sin comando en un canal.",
        opts: {
            channel: "Canal que quieres configurar.",
            enabled: "Activa o desactiva el modo sin comando.",
            yes: "Emoji para la opción positiva.",
            no: "Emoji para la opción negativa.",
            shrug: 'Emoji adicional. Usa "none" para desactivarlo.'
        }
    },
    "reset-emojis": {
        desc: "Restablece los emojis de un canal.",
        opts: {
            channel: "Canal al que aplicar la configuración."
        }
    },
    "set-emoji": {
        desc: "Configura los emojis de las encuestas.",
        opts: {
            channel: "Canal al que aplicar la configuración.",
            yes: "Emoji para la opción positiva.",
            no: "Emoji para la opción negativa.",
            shrug: "Emoji adicional para la encuesta."
        }
    },
    support: {
        desc: "Obtén el enlace del servidor de soporte."
    }
};
