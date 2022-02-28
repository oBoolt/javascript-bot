const ee = require("../../botconfig/embed.json")
const { StatusEmbed, errorbuilder } = require("../../handlers/functions")

module.exports = {
    name: 'status',
    permissions: ['SEND_MESSAGES'],
    aliases: ['config'],
    description: 'Mostra a configuração da fila',
    execute: async (client, message, args, Discord, cmd) => {
        const dPrefix = require('../../config.json').prefix;
        if (!message.guild.me.voice.channel) return message.channel.send(new MessageEmbed()
        .setColor(ee.wrongcolor)
        .setFooter(ee.footertext)
        .setTitle(`❌ ERROR | Nada Tocando na fila`));

        //if member not connected return error
        if (!message.member.voice.channel) return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext)
            .setTitle(`❌ ERROR | Por favor entre em um canal primeiro`));

        //if they are not in the same channel, return error
        if (message.member.voice.channel.id != message.guild.me.voice.channel.id) return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext)
            .setTitle(`❌ ERROR | Por favor entre no **meu** canal`)
            .setDescription(`Canal: <#${message.guild.me.voice.channel.id}>`)
        );

        //get the queue
        let queue = client.distube.getQueue(message);

        //if no queue return error
        if (!queue) return message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext)
            .setTitle(`❌ ERROR | Eu não estou tocando nada`)
            .setDescription(`Fila vazia`)
        );

        return message.channel.send(StatusEmbed(client, message));
    },
}