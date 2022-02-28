const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const { errorbuilder } = require('../../handlers/functions');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);
module.exports = {
    name: "lock",
    description: "Tranca o canal mencionado",
    permissions: ['SEND_MESSAGES', 'MANAGE_CHANNELS', 'VIEW_CHANNEL'],
    usage: "<#channel-name>",
    aliases: ["trancar"],
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const dPrefix = require('../../config.json').prefix;
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
            const memberRoleCheck = await db.fetch(`memberRole_${message.guild.id}`);
            const getMemberRole = await db.get(`memberRole_${message.guild.id}`);
            let memberRole;

            if (memberRoleCheck) {
                memberRole = message.guild.roles.cache.get(getMemberRole);
            } else return message.channel.send(`O \`Cargo de Membro\` não está configurado \nUse \`${prefix}setup memberRole @role-name\``);

            if (!args[0]) return message.channel.send('Por favor mencione um canal para trancar');
            if (!message.mentions.channels.first()) return message.channel.send('Por favor mencione um canal válido');

            await message.mentions.channels.forEach(async (channel) => {
                if (channel.name.startsWith('『🔒』')) return message.channel.send(`<#${channel.id}> já está trancado`);

                await channel.setName(`『🔒』${channel.name}`);

                try {
                    channel.createOverwrite(memberRole, {
                        VIEW_CHANNEL: true,
                        READ_MESSAGE_HISTORY: true,
                        SEND_MESSAGES: false,
                    });

                    message.channel.send(`Você trancou o canal <#${channel.id}> com sucesso`);
                } catch (err) {
                    console.log(`Erro: ${err}`);

                    message.channel.send(`Não foi possível trancar o canal <#${channel.id}>`);
                }
            });
        } catch (e) {
            errorbuilder(e, message);
        }
    },
};