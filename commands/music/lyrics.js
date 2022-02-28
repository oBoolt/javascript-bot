const { errorbuilder, lyricsEmbed } = require('../../handlers/functions')
const { MessageEmbed } = require("discord.js")
const ee = require('../../botconfig/embed.json')
const lyricsFinder = require('lyrics-finder');

module.exports = {
    name: 'lyrics',
    usage: "",
    aliases: ['l', 'letra'],
    permissions: ['SEND_MESSAGES'],
    description: 'Mostra a letra da música',
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const { channel } = message.member.voice; // { message: { member: { voice: { channel: { name: "Allgemein", members: [{user: {"username"}, {user: {"username"}] }}}}}

            let queue = client.distube.getQueue(message)

            if (!queue)
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Nada está tocando agora`)
                );

            let cursong = queue.songs[0];
            const searchEmbed = await message.channel.send(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`🔎 | Procurando...`)
            )
            let lyrics;

            await ksoft.lyrics.get(cursong.name).then(
                async track => {
                    if (!track.lyrics) return message.reply("Nenhuma letra encontrada!");
                    lyrics = track.lyrics;


                    let currentPage = 0;
                    const embeds = lyricsEmbed(client, message, lyrics, cursong);

                    const queueEmbed = await message.channel.send(
                        `**Página - ${currentPage + 1}/${embeds.length}**`,
                        embeds[currentPage]
                    );

                    try {
                        await queueEmbed.react("⬅️");
                        await queueEmbed.react("➡️");
                        await queueEmbed.react("⏹");
                    } catch (error) {
                        errorbuilder(error, message)
                    }

                    const filter = (reaction, user) => ["⬅️", "⏹", "➡️"].includes(reaction.emoji.id || reaction.emoji.name) && message.author.id === user.id;
                    const collector = queueEmbed.createReactionCollector(filter, {
                        time: 60000
                    });

                    collector.on("collect", async (reaction, user) => {
                        try {
                            if (reaction.emoji.id === "➡️" || reaction.emoji.name === "➡️") {
                                if (currentPage < embeds.length - 1) {
                                    currentPage++;
                                    queueEmbed.edit(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                                }
                            } else if (reaction.emoji.id === "➡️" || reaction.emoji.name === "⬅️") {
                                if (currentPage !== 0) {
                                    --currentPage;
                                    queueEmbed.edit(`**Página - ${currentPage + 1}/${embeds.length}**`, embeds[currentPage]);
                                }
                            } else {
                                collector.stop();
                                reaction.message.reactions.removeAll();
                            }
                            await reaction.users.remove(message.author.id);
                        } catch (error) {
                            errorbuilder(error, message);
                        }
                    });
                })
        } catch (error) {
            errorbuilder(error, message);
        }
    },
}
