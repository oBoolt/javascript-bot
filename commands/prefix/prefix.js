const { MessageEmbed } = require('discord.js');
const client = require('../../main');
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
const prefix = require('../../config.json').prefix;
module.exports = {
    name: "prefix",
    description: "Mude o prefixo do server",
    permissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
    usage: "<newPrefix>",
    aliases: ["prefixo"],
    execute: async (client, message, args, Discord, cmd) => {
        if (!args[0]) {
            let b = await db.get(`prefix_${message.guild.id}`);
            if (b) {
                return message.channel.send(
                    `**O prefixo desse server é \`${b}\`**`
                );
            } else return message.channel.send("**Por favor coloque um prefixo válido**");
        }

        try {

            let a = args.join(' ');
            let b = await db.get(`prefix_${message.guild.id}`);

            if (a === prefix) {
                await db.delete(`prefix_${message.guild.id}`);
                message.channel.send(`**O prefixo do server agora é \`${a}\`**`)
                message.guild.members.cache.get(client.user.id).setNickname(`${client.user.username}`);
                return;
            }
            if (a === b) {
                return message.channel.send(`**\`${args[1]}\` já é o prefixo do server**`)
            } else {
                await db.set(`prefix_${message.guild.id}`, a)
                message.channel.send(`**O prefixo do server agora é \`${a}\`**`)
                message.guild.members.cache.get(client.user.id).setNickname(`[${a}] ${client.user.username}`);

                return;
            }
        } catch (e) {
            console.log(e)
        }
    },
};