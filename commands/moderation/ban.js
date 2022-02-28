const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const { errorbuilder } = require('../../handlers/functions')
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);
module.exports = {
    name: "ban",
    description: "Bane um pessoa",
    permissions: ['SEND_MESSAGES', 'BAN_MEMBERS'],
    usage: "@<member> [reason]",
    execute: async (client, message, args, Discord, cmd) => {
        try {
            //const dPrefix = require('../../config.json').prefix;
            //let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
            let reason = args.slice(1).join(' ');
            const mentionedMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

            if (!reason) reason = 'Motivo Padrão';

            if (!args[0]) return message.channel.send(`Por favor mencione um membro`)
            if (!mentionedMember) return message.channel.send(`Por favor mencione um membro válido`)
            if (!mentionedMember.bannable) return message.channel.send(`Você não pode banir ${mentionedMember}`)

            try {
                let ban = new MessageEmbed()
                    .setColor("RED")
                    .setTitle("❗ Banido")
                    .setDescription("Você foi banido de um servidor!")
                    .addFields(
                        { name: `Tempo`, value: `\`∞\``, inline: true },
                        { name: `Servidor`, value: `\`${message.guild.name}\``, inline: true },
                        { name: `Motivo`, value: `\`${reason}\``, inline: true },
                    )
                    .setTimestamp();
                await mentionedMember.send(ban);
            } catch {
                message.channel.send("O usuario não está com as `Mensagens Diretas` diponivel");
            }

            try {
                await mentionedMember.ban({
                    days: 0,
                    reason: reason,
                }).then(() => message.channel.send(`${mentionedMember} foi banido com sucesso \nMotivo: \`${reason}\``));
            } catch {
                message.channel.send("Ouve um problema enquanto eu bania esse membro");
            }
        } catch (e) {
            errorbuilder(e, message)
        }
    },
};