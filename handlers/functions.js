const Discord = require('discord.js')
const ee = require("../botconfig/embed.json")
const { MessageEmbed } = require('discord.js')
const recon = require("reconlx");

module.exports.duration = duration;
module.exports.format = format;
module.exports.embedcreate = embedcreate;
module.exports.errorbuilder = errorbuilder;
module.exports.QueueEmbed = QueueEmbed;
module.exports.StatusEmbed = StatusEmbed;
module.exports.timeout = timeout;

function duration(ms) {
  const sec = Math.floor((ms / 1000) % 60).toString();
  const min = Math.floor((ms / (60 * 1000)) % 60).toString();
  const hrs = Math.floor((ms / (60 * 60 * 1000)) % 60).toString();
  const days = Math.floor((ms / (24 * 60 * 60 * 1000)) % 60).toString();
  return `\`${days}Days\`,\`${hrs}Hours\`,\`${min}Minutes\`,\`${sec}Seconds\``;
}

function format(millis) {
  try {
    var h = Math.floor(millis / 3600000),
      m = Math.floor(millis / 60000),
      s = ((millis % 60000) / 1000).toFixed(0);
    if (h < 1) return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s //+ " | " + (Math.floor(millis / 1000)) + " Segundos";
    else return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s //+ " | " + (Math.floor(millis / 1000)) + " Segundos";
  } catch (e) {
    console.log(String(e.stack).bgRed)
  }
}

function embedcreate(client, message, color, title, description, channel, thumbnail) {
  try {
    let embed = new MessageEmbed()
      .setColor(color)
      .setTitle(title);
    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);

    if (channel) {
      try {
        return channel.send(embed)
      } catch {
        message.channel.send(new MessageEmbed()
          .setColor(ee.wrongcolor)
          .setFooter(ee.footertext)
          .setTitle(`❌ ERRO | Um erro foi encontrado`)
          .setDescription(`Canal mencionado inválido`)
        )
      }
    }
    return message.channel.send(embed)
  } catch (e) {
    errorbuilder(e, message)
  }
}

async function errorbuilder(error, message, time = 60000) {
  console.log(error)
  let embedToDelete = await message.channel.send(new MessageEmbed()
    .setColor(ee.wrongcolor)
    .setFooter(ee.footertext)
    .setTitle(`❌ ERRO | Um erro foi encontrado`)
    .setDescription(`\`\`\`${error.stack}\`\`\``)
  )
  embedToDelete.react('🗑')
  const filter = (reaction, user) => {
    return reaction.emoji.name === '🗑' && user.id === message.author.id;
  };

  embedToDelete.awaitReactions(filter, { max: 1, time: time, errors: ['time'] })
    .then(collected => {
      embedToDelete.delete();
    })
    .catch(err => {
      embedToDelete.reactions.removeAll()
    });
}
function QueueEmbed(client, queue, currentPage) {
  try {
    let pages = [];
    let k = 20;
    for (let i = 0; i < queue.songs.length; i += 20) {
      let qus = queue.songs;
      const current = qus.slice(i, k);
      let j = i;
      k += 20;
      const info = current.map(track => `**${++j})** [${track.name}](${track.url}) - \`${track.formattedDuration}\``).join('\n');
      const queueEmbed = new MessageEmbed()
        .setTitle("Fila")
        .setColor('#fba732')
        .setFooter(`Duração da Fila: ${queue.formattedDuration}`)
        //.setFooter(`Duração da Fila: ${queue.formattedDuration} | Página - ${currentPage + 1}/${embeds.length}`)
        .setDescription(`${info}`)
      pages.push(queueEmbed);
    }
    return pages;
  } catch (error) {
    errorbuilder(error, message);
  }
}
function StatusEmbed(client, message) {
  try {
    let queue = client.distube.getQueue(message);
    let song = queue.songs[0];
    embed = new MessageEmbed()
      .setColor(ee.color)
      .setTitle("🎶 Playing Song:")
      .setDescription(`> [\`${song.name}\`](${song.url})`)
      .addField("💡 Solicitado Por:", `>>> ${song.user}`, true)
      .addField("⏱ Duração:", `>>> \`${queue.formattedCurrentTime} / ${song.formattedDuration}\``, true)
      .addField("🌀 Fila:", `>>> \`${queue.songs.length} música(s) - ${queue.formattedDuration}\``, true)
      .addField("🔊 Volume:", `>>> \`${queue.volume}%\``, true)
      .addField("♾ Loop:", `>>> ${queue.repeatMode ? queue.repeatMode === 2 ? "`✅ Fila`" : "`✅ Música`" : "`❌`"}`, true)
      .addField("🔄 Autoplay:", `>>> ${queue.autoplay ? "`✅`" : "`❌`"}`, true)
      .addField("❔ Filtro:", `>>> \`${queue.filter || "❌"}\``, true)
    return embed;
  } catch (error) {
    errorbuilder(error, message);
  }
}
// async function timeout(message, msgToDelete, time = 60000) {
//   msgToDelete.react('🗑')
//   const filter = (reaction, user) => {
//     return reaction.emoji.name === '🗑' && user.id === message.author.id;
//   };

//   msgToDelete.awaitReactions(filter, { max: 1, time: time, errors: ['time'] })
//     .then(collected => {
//       msgToDelete.delete()
//     })
//     .catch(err => {
//       msgToDelete.reactions.removeAll()
//     });
// }

async function timeout(message, msgToDelete, time = 10000) {
  if (!message) throw new ReferenceError('DuckBot => "message" is not defined')
  if (typeof time !== "number") throw new SyntaxError('DuckBot => typeof "time" must be number')
  if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) return console.log(`DuckBot err: Discord Client need "MANAGE_MESSAGES" to work properly.`)
  msgToDelete.react('🗑')
  const filter = (reaction, user) => {
    return reaction.emoji.name === '🗑' && user.id === message.author.id;
  };

  msgToDelete.awaitReactions(filter, { max: 1, time: time, errors: ['time'] })
    .then(collected => {
      msgToDelete.delete()
    })
    .catch(err => {
      msgToDelete.reactions.removeAll()
    });
}