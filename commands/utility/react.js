const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);
module.exports = {
    name: "react",
    description: "Mede o tempo de reagir",
    permissions: ['SEND_MESSAGES', 'ADMINISTRATOR'],
    usage: "",
    aliases: ["reactTime"],
    execute: async (client, message, args, Discord, cmd) => {
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        const date1 = Date.now();
        message.channel.send(">>> Calculando...").then(async msg =>{
            for(const emoji of emojis)
                await msg.react(emoji);
            msg.edit(`Para reagir com ${emojis.length} emojis eu demorei ${(Date.now() - date1) / 1000} segundos`);
            setTimeout(async () => {
                await msg.delete();
                await message.delete();
            }, 5000);
        });
    },
};