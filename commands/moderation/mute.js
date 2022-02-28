const { MessageEmbed } = require("discord.js");
const { errorbuilder } = require('../../handlers/functions');
const dPrefix = require('../../config.json').prefix;
const ms = require("ms");
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
module.exports = {
    name: "mute",
    description: "Silencia uma pessoa",
    permissions: ["MUTE_MEMBERS"],
    usage: "<member> [time](s, m, h, d)",
    aliases: ["tempmute"],
    execute: async (client, message, args, Discord) => {
        try {
            const dPrefix = require('../../config.json').prefix;
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
            const memberRoleCheck = await db.fetch(`memberRole_${message.guild.id}`);
            const getMemberRole = await db.get(`memberRole_${message.guild.id}`);
            let memberRole;

            if (memberRoleCheck) {
                memberRole = message.guild.roles.cache.get(getMemberRole);
            } else return message.channel.send(`O \`Cargo de Membro\` não está configurado \nUse \`${prefix}setup memberRole @role-name\``);

            if (!args[0]) return message.channel.send('Por favor mencione um canal para destrancar');
            if (!message.mentions.channels.first()) return message.channel.send('Por favor mencione um canal válido');

            await message.mentions.channels.forEach(async (channel) => {
                if (!channel.name.startsWith('『🔒』')) return message.channel.send(`<#${channel.id}> já está destrancado`);

                await channel.setName(channel.name.substring(4));

                try {
                    channel.createOverwrite(memberRole, {
                        VIEW_CHANNEL: true,
                        READ_MESSAGE_HISTORY: true,
                        SEND_MESSAGES: true,
                    });

                    message.channel.send(`Você destrancou o canal <#${channel.id}> com sucesso`);
                } catch (err) {
                    console.log(`Erro: ${err}`);

                    message.channel.send(`Não foi possível destrancar o canal <#${channel.id}>`);
                }
            });
        } catch (err) {
            errorbuilder(err, message);
        }
    },
}