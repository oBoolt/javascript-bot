const { MessageEmbed } = require("discord.js");
const { errorbuilder } = require('../../handlers/functions');
const dPrefix = require('../../config.json').prefix;
const ms = require("ms");
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
module.exports = {
    name: "unmute",
    description: "Dessilencia uma pessoa",
    permissions: ["MUTE_MEMBERS"],
    usage: "<member>",
    execute: async (client, message, args, Discord) => {
        try {
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

            //Mute Role
            const muteRoleCheck = await db.fetch(`muteRole_${message.guild.id}`);
            const getMuteRole = await db.get(`muteRole_${message.guild.id}`);
            const muteRole = message.guild.roles.cache.get(getMuteRole);
            //Member Role
            const memberRoleCheck = await db.fetch(`memberRole_${message.guild.id}`);
            const getMemberRole = await db.get(`memberRole_${message.guild.id}`);
            const membeRole = message.guild.roles.cache.get(getMemberRole);

            if (!muteRoleCheck) return message.channel.send(`O \`cargo mute\` não está configurado \nUse \`${prefix}setup muteRole @role-name\``);
            if (!memberRoleCheck) return message.channel.send(`O \`cargo membro\` não está configurado \nUse \`${prefix}setup memberRole @role-name\``);

            const target = message.mentions.users.first();

            if (!args[0]) {
                return message.channel.send("**Mecione um membro válido**").then((msg) => {
                    setTimeout(() => msg.delete(), 20000);
                });
            }

            if (target) {

                let memberRole = membeRole;
                let mutedRole = muteRole;

                let memberTarget = message.guild.members.cache.get(target.id);

                let muteEmbed = new MessageEmbed()
                    .setColor(message.guild.me.displayHexColor)
                    .setTitle('🔇 Mute Command')
                    .setFooter(message.author.username, message.author.avatarURL())
                    .setTimestamp();

                if (!args[1]) {
                    memberTarget.roles.remove(memberRole.id);
                    memberTarget.roles.add(mutedRole.id);
                    muteEmbed.setDescription(`<@${memberTarget.user.id}> foi mutado com sucesso`);
                    message.channel.send(muteEmbed);
                    return
                }
                memberTarget.roles.remove(memberRole.id);
                memberTarget.roles.add(mutedRole.id);
                muteEmbed.setDescription(`<@${memberTarget.user.id}> foi mutado por \`${ms(ms(args[1]))}\``);
                message.channel.send(muteEmbed)
                    .then((msg) => {
                        setTimeout(() => {
                            let editMutedEmbed = new MessageEmbed()
                                .setColor(message.guild.me.displayHexColor)
                                .setTitle('🔈 Unmute Command')
                                .setFooter(message.author.username, message.author.avatarURL())
                                .setDescription(`<@${memberTarget.user.id}> foi desmutado`)
                                .setTimestamp();
                            memberTarget.roles.remove(mutedRole.id);
                            memberTarget.roles.add(memberRole.id);
                            msg.edit(editMutedEmbed);
                        }, ms(args[1]));
                    })
                    .catch((err) => {
                        throw err;
                    });

            } else {
                message.channel.send("**Membro não encontrado**").then((msg) => {
                    setTimeout(() => msg.delete(), 10000);
                });
            }
        } catch (err) {
            errorbuilder(err, message)
        }
    },
}