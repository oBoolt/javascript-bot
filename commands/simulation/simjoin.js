const { MessageEmbed } = require('discord.js');
const dPrefix = require('../../config.json').prefix;
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
module.exports = {
    name: "simjoin",
    description: "Simula a sua entrada no servidor",
    permissions: ['ADMINISTRATOR'],
    usage: "",
    aliases: ["join", "entrar"],
    execute: async (client, message, args, Discord, cmd) => {

        let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

        client.on('guildMemberAdd', async (member) => {
            const welcomeChannelCheck = await db.fetch(`welcome_${message.guild.id}`);
            if (!welcomeChannelCheck) {
                const embed = new MessageEmbed()
                .setColor("RED")
                .setDescription(`O canal de boas vindas não está configurado \nUse \`${prefix}setup welcomeChannel #channel-name\` para configurar um canal`)
                .setTimestamp();
                return message.channel.send(embed);
            }
        });

        client.emit('guildMemberAdd', message.member);
    },
};