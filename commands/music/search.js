const { errorbuilder, timeout } = require('../../handlers/functions')
const { MessageEmbed } = require("discord.js")
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const ee = require('../../botconfig/embed.json')
const db = new Database(MongoURL);

module.exports = {
    name: 'search',
    usage: "<URL || MÚSICA>",
    aliases: ['procurar'],
    permissions: ['SEND_MESSAGES'],
    description: 'Procura uma música para adicionar ela a fila',
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const dPrefix = require('../../config.json').prefix;
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;
            const { channel } = message.member.voice; // { message: { member: { voice: { channel: { name: "Allgemein", members: [{user: {"username"}, {user: {"username"}] }}}}}
            // Usário não conectado a nenhum canal 
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
            // Argumentos não concedidos
            if (!args[0])
                return message.channel.send(new MessageEmbed()
                    .setColor(ee.wrongcolor)
                    .setTitle(`❌ ERRO | Por favor coloque uma música`)
                    .setDescription(`Usage: \`${prefix}play <URL / MÚSICA>\``)
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
            // Bot fora do canal
            if (!message.guild.me.voice.channel)
                message.member.voice.channel.join().catch(e => {
                    return message.channel.send(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setTitle(`❌ ERRO | O bot não tem permissião`)
                        .setDescription(`O bot não tem permissião de \`CONECTAR\` no canal <#${message.author.voice.channel.id}>`)
                    );
                })
            // Mensagem de Procurar
            const searchEmbed = await message.channel.send(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`🔎 | Procurando...`)
                .setDescription(`\`\`\`${args.join(' ')}\`\`\``)
            )
            // Search 
            const text = args.join(" ");
            let result = await client.distube.search(text);
            let searchresult = "";

            for (let i = 0; i < 10; i++) {
                try {
                    searchresult += await `**${i + 1})**. [${result[i].name}](${result[i].url}) - \`${result[i].formattedDuration}\`\n`;
                } catch {
                    searchresult = " ";
                }
            }

            // Edit searchEmbed to results
            await searchEmbed.edit(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`🔎 | Resultado`)
                .setDescription(searchresult)
                .setFooter("Digite o número da música no chat")
            )

            let userinput = 0;
            await message.channel.awaitMessages(m => m.author.id == message.author.id, {
                max: 1,
                time: 60000,
                errors: ["time"],
            }).then(async collected => {
                userinput = collected.first().content;

                if (Number(userinput) <= 0 || Number(userinput) > 10) {
                    return searchEmbed.edit(new MessageEmbed()
                        .setColor(ee.wrongcolor)
                        .setTitle(`❌ | Cancelado`)
                        .setDescription("Você digitou um número **inválido** \nDigite um número de 1 a 10")
                    ).then(msg => {
                        timeout(message, searchEmbed)
                    })
                } else {
                    await client.distube.play(message, result[userinput - 1].url)
                    await searchEmbed.edit(new MessageEmbed()
                        .setColor(ee.yescolor)
                        .setTitle(`🔎 | Resultado`)
                        .setDescription(`[${result[userinput - 1].name}](${result[userinput - 1].url})`)
                        .setThumbnail(result[userinput - 1].thumbnail)
                    ).then(msg => {
                        setTimeout(function () {
                            msg.delete();
                        }, 10000)
                    })
                }
            }).catch(() => {
                console.error;
                userinput = 404
            });

            if (userinput === 404)
                return searchEmbed.delete();

            message.delete();
        } catch (error) {
            errorbuilder(error, message);
        }
    },
}
