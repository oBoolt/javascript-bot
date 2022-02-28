module.exports = {
    name: "uptime",
    aliases: ["uptime"],
    permissions: [],
    description: "Returns the duration of how long the Bot is online",
    usage: "[command], [aliases]",
    execute: async (client, message, args, Discord, cmd) => {
        function duration(ms) {
            const sec = Math.floor(ms / 1000 % 60).toString();
            const min = Math.floor(ms / (60*1000) % 60).toString();
            const hrs = Math.floor(ms / (60*60*1000) % 60).toString();
            const days = Math.floor(ms / (24*60*60*1000) % 60).toString();
            return `\`${days} Dias ${hrs} Horas ${min} Minutos ${sec} Segundos\``
        }
        message.channel.send(`:white_check_mark: **${client.user.username}** está online há ${duration(client.uptime)}`);
    }
}