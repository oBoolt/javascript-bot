const { MessageEmbed } = require('discord.js');
module.exports = {
    name: "invite",
    description: "Envia o convite do Bot",
    permissions: ['SEND_MESSAGES'],
    usage: "",
    aliases: ["inv", "convite"],
    execute: async (client, message, args, Discord, cmd) => {
        let embed = new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setDescription("[[Clique Aqui]](https://discord.com/api/oauth2/authorize?client_id=865299394528804864&permissions=8&scope=bot)")
            .setFooter(message.author.username, message.author.avatarURL())
            .setTimestamp()
        message.channel.send(embed)
    },
};