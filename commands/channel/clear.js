const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const { errorbuilder } = require('../../handlers/functions');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);
module.exports = {
    name: "clear",
    description: "Limpa o chat",
    permissions: ['SEND_MESSAGES', 'MANAGE_MESSAGES'],
    usage: "<number>",
    aliases: ["limpar"],
    execute: async (client, message, args, Discord, cmd) => {
        const dPrefix = require('../../config.json').prefix;
        let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
        try {
            let deleteAmount;
            if (isNaN(args[0]) || parseInt(args[0]) <= 0) { return message.channel.send(`\`${args[0]}\` não é um número`) }
            if (args[0] < 2) return message.channel.send("O número minimo de mensagem é 2");
            if (args[0] > 100) {
                return message.reply("Você apenas pode apagar até 100 mensagens de uma vez");
            } else {
                deleteAmount = parseInt(args[0]);
            }

            await message.delete();
            message.channel.bulkDelete(deleteAmount, true);
            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle(`🧹 Você apagou \`${deleteAmount}\` mensagens com sucesso 🧹`)
                .setTimestamp()
                .setFooter(message.author.username, message.author.avatarURL({ dynamic: true }));
            message.channel.send(embed).then((msg) => {
                setTimeout(() => {
                    msg.delete();
                }, 2500);
            });
        } catch (err) {
            errorbuilder(err, message);
        }
    },
};