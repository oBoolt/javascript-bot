const { MessageEmbed } = require('discord.js')
const { errorbuilder } = require('../../handlers/functions')
const ee = require('../../botconfig/embed.json')
module.exports = {
    name: "serverinfo",
    permissions: ['SEND_MESSAGES'],
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const guild = message.guild;
            message.channel.send(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`ServerInfo`)
                .addFields(
                    { name: `Nome`, value: `${guild}` },
                    { name: `Data de criação`, value: `<t:${Math.floor(guild.createdTimestamp / 1000.0)}:R>` },
                    { name: `Membros`, value: `${guild.memberCount}/${guild.maximumMembers}` },
                    { name: `Regras`, value: `${guild.rulesChannelId ? `<#${guild.rulesChannelId}>` : `Canal não configurado`}` },
                )
            );
        } catch (e) {
            errorbuilder(e, message)
        }
    },
};