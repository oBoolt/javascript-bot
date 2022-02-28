const ee = require("../../botconfig/embed.json")
const { QueueEmbed, errorbuilder } = require("../../handlers/functions")
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'queue',
    aliases: ['q'],
    permissions: ['SEND_MESSAGES'],
    description: 'Mostra a fila de músicas',
    execute: async (client, message, args, Discord, cmd) => {
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

        let currentPage = 0;
        const embeds = QueueEmbed(client, queue, currentPage)
        const queueEmbed = await message.channel.send(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
        message.delete();

        try {
            await queueEmbed.react("⬅️");
            await queueEmbed.react("➡️");
            await queueEmbed.react("⏹");
        } catch (error) {
            errorbuilder(error, message);
        }

        const filter = (reaction, user) => ["⬅️", "⏹", "➡️"].includes(reaction.emoji.id || reaction.emoji.name) && message.author.id === user.id;
        const collector = queueEmbed.createReactionCollector(filter, {
            time: 5 * 60000
        });

        collector.on("collect", async (reaction, user) => {
            try {
                switch (reaction.emoji.id || reaction.emoji.name) {
                    case "➡️":
                        if (currentPage < embeds.length - 1) {
                            currentPage++;
                            queueEmbed.edit(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }else{
                            currentPage = 0;
                            queueEmbed.edit(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                        break;
                    case "⬅️":
                        if (currentPage !== 0) {
                            --currentPage;
                            queueEmbed.edit(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }else{
                            currentPage = embeds.length - 1;
                            queueEmbed.edit(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                        }
                        break;
                    default:
                        collector.stop();
                        reaction.message.reactions.removeAll();
                        setTimeout(function () {
                            queueEmbed.delete();
                        }, 1000)
                        break;
                }
                await reaction.users.remove(message.author.id);
            } catch (e) {
                errorbuilder(error, message);
            }
        });
    },
}