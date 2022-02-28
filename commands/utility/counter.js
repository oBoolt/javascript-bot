const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);
module.exports = {
    name: "counter",
    description: "Conta o tamanho da frase",
    permissions: ['SEND_MESSAGES'],
    usage: "<frase>",
    aliases: ["count"],
    execute: async (client, message, args, Discord, cmd) => {
        const dPrefix = require('../../config.json').prefix;
        let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
        let date1 = Date.now();
        message.channel.send("**Pong...**").then(msg => {
            const embed = new MessageEmbed()
                .setColor(message.guild.me.displayHexColor)
                .setDescription(`⏰ API: ${Math.round(client.ws.ping)}ms\n⌛ PING: ${Date.now() - date1}ms`)
            message.channel.send(embed)
            msg.delete();
        })
    },
};