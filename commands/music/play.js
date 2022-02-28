const { getTracks, getPreview } = require("spotify-url-info")
const { errorbuilder } = require('../../handlers/functions')
const { MessageEmbed } = require("discord.js")
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const ee = require('../../botconfig/embed.json')
const db = new Database(MongoURL);

module.exports = {
    name: 'play',
    usage: "<URL || MÚSICA>",
    aliases: ['p'],
    permissions: ['SEND_MESSAGES'],
    description: 'Coloca uma música na fila',
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
            const text = args.join(' ');
            message.delete();
            message.channel.send(new MessageEmbed()
                .setColor(ee.yescolor)
                .setTitle(`🔎 | Procurando...`)
                .setDescription(`\`\`\`\n${text}\n\`\`\``)
            ).then(msg => msg.delete({ timeout: 3000 }).catch(e => console.log(e.message)))
            //https://open.spotify.com/track/5nTtCOCds6I0PHMNtqelas
            if (args.join(" ").toLowerCase().includes("spotify") && args.join(" ").toLowerCase().includes("track")) {
                getPreview(args.join(" ")).then(result => {
                    client.distube.play(message, result.title);
                })
            }
            else if (args.join(" ").toLowerCase().includes("spotify") && args.join(" ").toLowerCase().includes("playlist")) {
                getTracks(text).then(result => {
                    for (const song of result)
                        client.distube.play(message, song.name);
                })
            }
            else {
                client.distube.play(message, text);
            }
        } catch (error) {
            errorbuilder(error, message);
        }
    },
}
