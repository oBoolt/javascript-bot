const { errorbuilder } = require("../../handlers/functions");
const { MessageEmbed } = require("discord.js");
const { Database } = require("quickmongo");
const MongoURL = require("../../config.json").QuickMongoURL;
const ee = require("../../botconfig/embed.json");
const db = new Database(MongoURL);

module.exports = {
  name: "loop",
  permissions: ["SEND_MESSAGES"],
  description: "Muda o autoplay para desligado/ligado",
  aliases: ["repeat"],
  usage: "",
  execute: async (client, message, args, Discord, cmd) => {
    try {
      const dPrefix = require("../../config.json").prefix;
      // Bot Prefix
      let prefix = (await db.get(`prefix_${message.guild.id}`))
        ? await db.get(`prefix_${message.guild.id}`)
        : dPrefix;
      // DJ ROLE
      const djRoleCheck = await db.fetch(`djRole_${message.guild.id}`);
      const getDjRole = await db.get(`djRole_${message.guild.id}`);
      const djRole = message.guild.roles.cache.get(getDjRole);
      // Member Channel
      const { channel } = message.member.voice; // { message: { member: { voice: { channel: { name: "Allgemein", members: [{user: {"username"}, {user: {"username"}] }}}}}
      // DJ role não configuirado
      if (!djRoleCheck)
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | Cargo de DJ não está configurado`)
            .setDescription(
              `Use: \`${prefix}setup djRole @role-name\` para configurar o cargo`
            )
        );
      // Usário sem cargo de DJ
      if (!message.member.roles.cache.has(djRole.id))
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | Você não tem o cargo de DJ`)
            .setDescription(`Cargo Necessário: <@&${djRole.id}>`)
        );
      // Usário não conectado a nenhum canal
      if (!channel)
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | Por favor entre em um canal primeiro`)
        );
      // Usário em um canal diferente do bot
      if (
        client.distube.getQueue(message) &&
        channel.id !== message.guild.me.voice.channel.id
      )
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | Por favor entre no **meu** canal`)
            .setDescription(`Canal: <#${message.guild.me.voice.channel.id}>`)
        );
      //Bot sem permissão "CONNECT"
      if (
        !message.guild.me
          .permissionsIn(message.member.voice.channel)
          .has("CONNECT")
      )
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | O bot não tem permissão`)
            .setDescription(
              `O bot não tem permissião de \`CONECTAR\` no canal <#${channel.id}>`
            )
        );
      //Bot sem permissão "SPEAK"
      if (
        !message.guild.me
          .permissionsIn(message.member.voice.channel)
          .has("SPEAK")
      )
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | O bot não tem permissão`)
            .setDescription(
              `O bot não tem permissião de \`FALAR\` no canal <#${channel.id}>`
            )
        );
      if (!args[0])
        return message.channel.send(
          new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setTitle(`❌ ERRO | Você não especificou o filtro`)
            .setDescription(
              `Filtros disponiveis: \`3d, bassboost, echo, karaoke, nightcore, vaporwave, clear, 8D, phaser, tremolo, vibrato, reverse, treble, normalizer, surrounding, pulsator, subboost, flanger, gate, haas, mcompand, cursed\``
            )
            .setFooter(
              "Para desativar algum filtro da fila apenas digite ele denovo"
            )
        );
      const mode = client.distube.setRepeatMode(message);
      message.channel.send(
        new MessageEmbed()
          .setColor(ee.yescolor)
          .setTitle(
            `✅ SUCESSO | Modo de repetição setado para ${
              queue.repeatMode
                ? queue.repeatMode === 2
                  ? "Fila"
                  : "`Música"
                : "Desligado"
            }`
          )
      );
    } catch (error) {
      errorbuilder(error, message);
    }
  },
};
