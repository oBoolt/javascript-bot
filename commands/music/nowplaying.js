const { MessageEmbed } = require("discord.js");
const { errorbuilder, format } = require("../../handlers/functions");
const ee = require("../../botconfig/embed.json");
const bar = require(`stylish-text`)
module.exports = {
  name: "nowplaying",
  description: "Mostra os detalhes da música que está tocando",
  permissions: ['SEND_MESSAGES'],
  usage: "",
  aliases: ["np", "nowplay"],
  execute: async (client, message, args, Discord, cmd) => {
    try {
      const { channel } = message.member.voice; // { message: { member: { voice: { channel: { name: "Allgemein", members: [{user: {"username"}, {user: {"username"}] }}}}}
      if (!client.distube.getQueue(message))
        return message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext)
          .setTitle(`❌ ERROR | Eu não estou tocando nada`)
          .setDescription(`Fila vazia`)
        )

      let queue = client.distube.getQueue(message);
      let track = queue.songs[0];
      let next = queue.songs[1] ? `✅ [${queue.songs[1].name}](${queue.songs[1].url}) - \`${queue.songs[1].formattedDuration}\`` : `🚫 Mais nada na fila`;
      //console.log(track)
      const year = track.info.videoDetails.uploadDate.slice(0, 4);
      const month = track.info.videoDetails.uploadDate.slice(5, 7);
      const day = track.info.videoDetails.uploadDate.slice(8, 10);
      const date = `${day}/${month}/${year}`;
      const ispaused = client.distube.isPaused(message) === true ? "▶" : "⏸";

      function toReadableTime(given) {
        var time = given;
        var minutes = "0" + Math.floor(time / 60);
        var seconds = "0" + (time - minutes * 60);
        return minutes.substr(-2) + ":" + seconds.substr(-2);
      }

      const current = Math.floor(queue.connection.dispatcher.streamTime / 1000) //ms --> seconds
      const end = track.duration //video in seconds

      const value = (current * (100 / end) / 5)

      bar.default.full = "█";
      bar.default.empty = " - ";
      bar.default.start = "";
      bar.default.end = "";
      bar.default.text = "{bar}";

      let npEmbed = await message.channel.send(new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext)
        .setTitle(`:musical_note: ${track.name}`)
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .addField("Views", `:eye: \`${track.views}\``, true)
        .addField("Likes", `:thumbsup: \`${track.likes}\``, true)
        .addField("Dislikes", `:thumbsdown: \`${track.dislikes}\``, true)
        .addField("Canal de Voz", `<#${message.guild.me.voice.channel.id}>`, true)
        .addField("Publicado Por", `👤 [\`${track.info.videoDetails.ownerChannelName}\`](${track.info.videoDetails.ownerProfileUrl})`, true)
        .addField('Publicador Em', `🗓️ \`${date}\``, true)
        .addField(`${ispaused} Duração `, `${toReadableTime(current)} - [${bar.progress(20, value)}] - ${track.formattedDuration}`)
        .addField("Próxima", `${next}`)
      )
      message.delete();

      // React
      try {
        await npEmbed.react("⬅️");
        await npEmbed.react("⏯️");
        await npEmbed.react("➡️");
        await npEmbed.react("⏩");
        await npEmbed.react("🔄");
        await npEmbed.react("🔉");
        await npEmbed.react("🔊");
        // Error
      } catch (e) {
        errorbuilder(e, message)
      }
      // Filter
      const filter = (reaction, user) => ["⬅️", "⏯️", "➡️", "⏩", "🔄", "🔉", "🔊"].includes(reaction.emoji.id || reaction.emoji.name) && message.author.id === user.id;
      // Collector
      const collector = npEmbed.createReactionCollector(filter, {
        time: 5 * 60000
      });

      let npEmbedUp = new MessageEmbed()
        .setColor(ee.color)
        .setFooter(ee.footertext)
        .setTitle(`:musical_note: ${track.name}`)
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .addField("Views", `:eye: \`${track.views}\``, true)
        .addField("Likes", `:thumbsup: \`${track.likes}\``, true)
        .addField("Dislikes", `:thumbsdown: \`${track.dislikes}\``, true)
        .addField("Canal de Voz", `<#${message.guild.me.voice.channel.id}>`, true)
        .addField("Publicado Por", `👤 [\`${track.info.videoDetails.ownerChannelName}\`](${track.info.videoDetails.ownerProfileUrl})`, true)
        .addField('Publicador Em', `🗓️ \`${date}\``, true)
        .addField(`${ispaused} Duração `, `${queue.formattedCurrentTime} - [${bar.progress(20, value)}] - ${track.formattedDuration}`)
        .addField("Próxima", `${next}`)

      // Event COllect
      collector.on("collect", async (reaction, user) => {
        try {
          switch (reaction.emoji.id || reaction.emoji.name) {
            case "⬅️":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              let backTime = queue.currentTime - 15 * 1000;
              if (backTime < 0)
                backTime = 0;
              if (backTime >= queue.songs[0].duration * 1000 - queue.currentTime)
                backTime = 0;
              client.distube.seek(message, backTime);
              npEmbed.edit(`A música voltou \`15 segundos\` para: ${queue.formattedCurrentTime}`, npEmbedUp);
              break;
            case "⏯️":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              if (client.distube.isPlaying(message)) {
                client.distube.pause(message);
                npEmbed.edit("Música pausada", npEmbedUp)
              } else if (client.distube.isPaused(message)) {
                client.distube.resume(message);
                client.distube.pause(message);
                client.distube.resume(message);
                npEmbed.edit("Música despausada", npEmbedUp)
              }
              break;
            case "➡️":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              seektime = queue.currentTime + 15 * 1000
              if (seektime < 0)
                seektime = queue.songs[0].duration * 1000;
              if (seektime >= queue.songs[0].duration * 1000);
              seektime = queue.songs[0].duration * 1000 - 1000;
              client.distube.seek(message, seektime);
              npEmbed.edit(`A música avançou \`15 segundos\` para: ${queue.formattedCurrentTime}`, npEmbedUp);
              break;
            case "⏩":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              if (queue.songs[1]) {
                client.distube.skip(message);
                npEmbed.edit(`Passando para próxima música`, npEmbedUp);
              }else npEmbed.edit(`A fila acaba nessage música`, npEmbedUp);
              break;
            case "🔄":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              const mode = client.distube.setRepeatMode(message)
              npEmbed.edit(`Loop: ${mode ? mode === 2 ? "`✅ Fila`" : "`✅ Música`" : "`❌`"}`, npEmbedUp);
              break;
            case "🔉":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              client.distube.setVolume(message, client.distube.getVolume() - 10);
              if (client.distube.volume < 10) client.distube.setVolume(message, 0);
              npEmbed.edit(`Volume setado para ${client.distube.getVolume()}`, npEmbedUp);
              break;
            case "🔊":
              if(!queue) return npEmbed.edit(`Nada Tocando`, npEmbedUp);
              client.distube.setVolume(message, client.distube.getVolume() + 10);
              if (client.distube.volume > 200) client.distube.setVolume(message, 200);
              npEmbed.edit(`Volume setado para ${client.distube.getVolume()}`, npEmbedUp);
              break;
          }
          await npEmbed.edit(npEmbedUp);
          await reaction.users.remove(message.author.id);
        } catch (e) {
          errorbuilder(e, message);
        }
      });

      try{
        setInterval(function(){ 
          npEmbed.edit(npEmbedUp)
        }, 5000);
      }catch (e) {
        errorbuilder(e, message);
      }
      
    } catch (e) {
      errorbuilder(e, message)
    }
  }
}