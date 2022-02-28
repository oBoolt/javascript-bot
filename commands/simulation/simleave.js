const { MessageEmbed } = require('discord.js');
const dPrefix = require('../../config.json').prefix;
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
module.exports = {
    name: "simleave",
    description: "Simula a sua entrada no servidor",
    permissions: ['ADMINISTRATOR'],
    usage: "",
    aliases: ["leave", "sair"],
    execute: async (client, message, args, Discord, cmd) => {

        let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

        client.on('guildMemberRemove', async (member) => {
            const leaveChannelCheck = await db.fetch(`leave_${message.guild.id}`);
            if (!leaveChannelCheck) {
                const embed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`O canal de saída não está configurado \nUse \`${prefix}setup leaveChannel #channel-name\` para configurar um canal`)
                .setTimestamp();
                return message.channel.send(embed);
            }
        });

        client.emit('guildMemberRemove', message.member);
    },
};