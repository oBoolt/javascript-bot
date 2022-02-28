const { errorbuilder } = require('../../handlers/functions')
const { MessageEmbed } = require("discord.js")
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const ee = require('../../botconfig/embed.json')
const db = new Database(MongoURL);

module.exports = {
    name: 'autoplay',
    permissions: ['SEND_MESSAGES'],
    description: 'Muda o autoplay para desligado/ligado',
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const dPrefix = require('../../config.json').prefix;
            // Bot Prefix
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
            // DJ ROLE
            const djRoleCheck = await db.fetch(`djRole_${message.guild.id}`);
            const getDjRole = await db.get(`djRole_${message.guild.id}`);
            const djRole = message.guild.roles.cache.get(getDjRole);
            // Member Channel
            const { channel } = message.member.voice; // { message: { member: { voice: { channel: { name: "Allgemein", members: [{user: {"username"}, {user: {"username"}] }}}}}
            // Usário não conectado a nenhum canal 
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
            // Usário em um canal diferente do bot
            if (client.distube.getQueue(message) && channel.id !== message.guild.me.voice.channel.id)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Por favor entre no **meu** canal`)
                    .setDescription(`Canal: <#${message.guild.me.voice.channel.id}>`)
                );
            //Bot sem permissão "CONNECT"
            if (!message.guild.me.permissionsIn(message.member.voice.channel).has("CONNECT"))
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | O bot não tem permissão`)
                    .setDescription(`O bot não tem permissião de \`CONECTAR\` no canal <#${channel.id}>`)
                );
            //Bot sem permissão "SPEAK"
            if (!message.guild.me.permissionsIn(message.member.voice.channel).has("SPEAK"))
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | O bot não tem permissão`)
                    .setDescription(`O bot não tem permissião de \`FALAR\` no canal <#${channel.id}>`)
                );
            // Change AutoPlay Mode
            let mode = client.distube.toggleAutoplay(message);
            message.channel.send(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`✅ SUCESSO | Autoplay`)
                .setDescription(`O modo Autoplay foi **${(mode ? "ativado" : "desativado")}**`)
            ).then(msg => {
                setTimeout(function () {
                    msg.delete();
                }, 3000)
            }).catch(e => console.log(e));
            message.delete();
        } catch (error) {
            errorbuilder(error, message);
        }
    },
}

