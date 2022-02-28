const Distube = require("distube");
const ee = require("../botconfig/embed.json");
const config = require("../config.json");
const { MessageEmbed } = require("discord.js");
const { format, errorbuilder } = require("../handlers/functions")
module.exports = (client) => {

    client.distube = new Distube(client, {
        searchSongs: false,
        emitNewSongOnly: false,
        highWaterMark: 1024 * 1024 * 64,
        leaveOnEmpty: true,
        leaveOnFinish: false,
        leaveOnStop: false,
        emptyCooldown: 5,
        // youtubeCookie --> prevents ERRORCODE: "429"
        youtubeDL: true,
        updateYouTubeDL: true,
        customFilters: {
            "clear": "dynaudnorm=f=200",
            "bassboost": "bass=g=20,dynaudnorm=f=200",
            "8D": "apulsator=hz=0.08",
            "vaporwave": "aresample=48000,asetrate=48000*0.8",
            "nightcore": "aresample=48000,asetrate=48000*1.25",
            "phaser": "aphaser=in_gain=0.4",
            "tremolo": "tremolo",
            "vibrato": "vibrato=f=6.5",
            "reverse": "areverse",
            "treble": "treble=g=5",
            "normalizer": "dynaudnorm=f=200",
            "surrounding": "surround",
            "pulsator": "apulsator=hz=1",
            "subboost": "asubboost",
            "karaoke": "stereotools=mlev=0.03",
            "flanger": "flanger",
            "gate": "agate",
            "haas": "haas",
            "mcompand": "mcompand",
            "cursed": "vibrato=f=6.5,tremolo,aresample=48000,asetrate=48000*1.25"
        }

    })

    // Queue status template
    const status = queue => `Volume: \`${queue.volume}%\` | Filtro: \`${queue.filter || "❌"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "✅ Fila" : "✅ Música" : "❌"}\` | Autoplay: \`${queue.autoplay ? "✅" : "❌"}\``;

    // DisTube event listeners, more in the documentation page
    client.distube
        .on("playSong", (message, queue, song) => message.channel.send(new MessageEmbed()
            .setColor(ee.color)
            .setTitle('🎵 Tocando')
            .addField("Música", `[${song.name}](${song.url}) - \`${song.formattedDuration}\``)
            .addField("Status", status(queue))
            .setThumbnail(song.thumbnail)
            .setFooter(`Solicitado Por: ${song.user.tag}`, song.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
        ).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, song.duration * 1000)
        })
        )
        .on("addSong", (message, queue, song) => message.channel.send(new MessageEmbed()
            .setTitle("📨 Adicionada a Fila")
            .setColor(ee.queuecolor)
            .addField(`${queue.songs.length}º na fila`, `Duração da fila: \`${format(queue.duration * 1000)}\``)
            .addField("Música", `[${song.name}](${song.url}) - \`${song.formattedDuration}\``)
            .setThumbnail(song.thumbnail)
            .setFooter(`Solicitado Por: ${song.user.tag}`, song.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
        ).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, 1 * 60000)
        })
        )
        .on("playList", (message, queue, playlist, song) => message.channel.send(new MessageEmbed()
            .setTitle(`🎵 Playlist Tocando`)
            .setColor(ee.color)
            .addField("Playlist", `[${playlist.name}](${playlist.url})`)
            .addField("Música Tocando", `[${song.name}](${song.url})`)
            //.addField("Duração da Fila", `\`${playlist.formattedDuration}\``)
            .addField(`${queue.songs.length} Músicas na Fila`, `**Duração da Fila: \`${playlist.formattedDuration}\`**`)
            .setThumbnail(playlist.thumbnail.url)
            .setFooter(`Solicitado Por: ${song.user.tag}`, song.user.displayAvatarURL({ dynamic: true }))
        ).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, song.duration * 1000)
        })
        )
        .on("addList", (message, queue, playlist) => message.channel.send(new MessageEmbed()
            .setTitle("📨 Adicionada a Fila")
            .setURL(playlist.url)
            .setColor(ee.queuecolor)
            .addField("Playlist", `[${playlist.name}](${playlist.url})`)
            .addField(`${queue.songs.length} Músicas na Fila`, `**Duração da Fila: \`${playlist.formattedDuration}\`**`)
            .setThumbnail(playlist.thumbnail.url)
            .setFooter(`Solicitado Por: ${playlist.user.tag}`, playlist.user.displayAvatarURL({ dynamic: true }))
        ).then(msg => {
            setTimeout(function () {
                msg.delete();
            }, 1 * 60000)
        })
        )
        .on("searchResult", (message, result) =>
            message.channel.send(new MessageEmbed()
                .setTitle("**Escolha uma das músicas**")
                .setURL(song.url)
                .setColor(ee.color)
                .setDescription(`${result.map((song, i) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n\n*Enter anything else or wait 60 seconds to cancel*`)
                .setFooter(ee.footertext)
            )
        )
        .on("searchCancel", (message) => message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext)
            .setTitle(`❌ ERROR | Pesquisa Cancelada`)
        )
        )
        .on('empty', (message) => message.channel.send(new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext)
            .setTitle(`❌ VAZIO | Canal de Voz vazio`)
            .setDescription("Eu sai porque o canal de voz mestá vazio")
        ).then(msg => {
            setTimeout(function () {
                msg.delete
            }, 10 * 1000)
        })
        )
        .on("error", async (message, e) => {
            errorbuilder(e, message);
        })
        .on("initQueue", queue => {
            queue.autoplay = false;
            queue.volume = 100;
        }
        )

}