const { MessageEmbed } = require('discord.js');
const client = require('../../main');
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
const prefix = require('../../config.json').prefix;
module.exports = {
    name: "resetprefix",
    description: "Resete o prefixo",
    permissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
    usage: "",
    execute: async (client, message, args, Discord, cmd) => {
        const checkPrefix = await db.fetch(`prefix_${message.guild.id}}`);
        const getPrefix = await db.get(`prefix_${message.guild.id}`);
        if (!args[0]) {
            if (getPrefix) {
                db.delete(`prefix_${message.guild.id}`);
                message.channel.send(`**O prefixo do server foi resetado para \`${prefix}\`**`)
                message.guild.members.cache.get(client.user.id).setNickname(`${client.user.username}`);
                return;
            } else return message.channel.send(`Você não mudou o prefixo padrão do servidor, ele ainda é \`${prefix}\``);
        }
    },
};