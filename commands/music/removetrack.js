const { errorbuilder } = require('../../handlers/functions')
const { MessageEmbed } = require("discord.js")
const { Database } = require('quickmongo');
const ee = require('../../botconfig/embed.json')
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);

module.exports = {
    name: 'removetrack',
    usage: "<Song Number>",
    aliases: ['remove'],
    permissions: ['SEND_MESSAGES'],
    description: 'Remove uma música da fila',
    execute: async (client, message, args, Discord, cmd) => {
        try {
            // VARIAVEIS
            const dPrefix = require('../../config.json').prefix;
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
            const queue = client.distube.getQueue(message);
            // dj role
            const djRoleCheck = await db.fetch(`djRole_${message.guild.id}`);
            const getDjRole = await db.get(`djRole_${message.guild.id}`);
            const djRole = message.guild.roles.cache.get(getDjRole);

            const { channel } = message.member.voice; // { message: { member: { voice: { channel: { name: "Allgemein", members: [{user: {"username"}, {user: {"username"}] }}}}}
            if (!djRoleCheck)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Cargo de DJ não está configurado`)
                    .setDescription(`Use: \`${prefix}setup djRole @role-name\` para configurar o cargo`)
                );
            if (!message.member.roles.cache.has(djRole.id))
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Você não tem o cargo de DJ`)
                    .setDescription(`Cargo Necessário: <@&${djRole.id}>`)
                );
            if (!channel)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Por favor entre em um canal primeiro`)
                );
            if (client.distube.getQueue(message) && channel.id !== message.guild.me.voice.channel.id)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Por favor entre no **meu** canal`)
                    .setDescription(`Canal: <#${message.guild.me.voice.channel.id}>`)
                );
            if (!args[0])
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Por favor coloque um número de uma música`)
                    .setDescription(`Usage: \`${prefix}removetrack <Song Number>\``)
                );
            if (isNaN(args[0]) || Number(args[0] - 1) >= queue.songs.length)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Por favor coloque um número de uma música **VÁLIDO**`)
                    .setDescription(`Usage: \`${prefix}removetrack <Song Number>\``)
                );
            if (args[0] <= 1)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Coloque um número acima de 1`)
                );

            var track = queue.songs[Number(args[0]) - 1]
            queue.songs.splice(Number(args[0]), Number(args[0]) - 1);
            message.channel.send(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`✅ SUCESSO | Música removida com sucesso`)
                .setDescription(`Música [${track.name}](${track.url}) removida com sucesso`)
            );
            message.delete();
        } catch (error) {
            errorbuilder(error, message);
        }
    },
}
