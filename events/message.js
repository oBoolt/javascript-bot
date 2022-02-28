const fs = require("fs");
const client = require("../main");
const { MessageEmbed } = require("discord.js");
const { Database } = require("quickmongo");
const MongoURL = require("../config.json").QuickMongoURL;
const db = new Database(MongoURL);
const dPrefix = require("../config.json").prefix;
client.on("message", async (message, Discord) => {
  let prefix = (await db.get(`prefix_${message.guild.id}`))
    ? await db.get(`prefix_${message.guild.id}`)
    : dPrefix;

  if (message.author.bot) return;

  /*
    if () {
        const mentionEmbed = new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setTitle(client.user.tag)
            .setDescription(`Use o comando \`${prefix}help\` para mostrar a lista de comandos`)
            .addFields(
                { name: `Prefixo`, value: `\`${dPrefix}\`` },
                { name: `Prefixo do Servidor`, value: `\`${prefix}\`` },
                { name: `Membros do Servidor`, value: `\`${client.guilds.cache.get(message.guild.id).memberCount}°\`` },
                { name: `Convite do Bot`, value: `[clique aqui](https://discord.com/api/oauth2/authorize?client_id=865299394528804864&permissions=8&scope=bot)` },
            )
            .setFooter(message.author.username, message.author.avatarURL())
            .setTimestamp();
        message.channel.send(mentionEmbed);
        return;
    }
    */

  let newPrefix = (await db.get(`prefix_${message.guild.id}`))
    ? await db.get(`prefix_${message.guild.id}`)
    : prefix;

  // let color = message.member.displayHexColor;
  // if (color == '#000000') color = message.member.hoistRole.hexColor;
  let color = "#fff";
  const logChannelCheck = await db.fetch(`log_${message.guild.id}`);
  if (logChannelCheck) {
    let contentEmbed = new MessageEmbed()
      .setColor(color)
      .setTitle("Log")
      .addField(`Usuário`, `<@${message.author.id}>`, true)
      .addField(`Canal`, `<#${message.channel.id}>`, true)
      .addField(`Mensagem`, `${message.content}`)
      .setTimestamp();
    const getLogChannel = await db.get(`log_${message.guild.id}`);
    const logChannel = message.guild.channels.cache.get(getLogChannel);
    logChannel.send(contentEmbed);
  }

  if (!message.content.startsWith(newPrefix)) return;

  const args = message.content.slice(newPrefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();

  const command =
    client.commands.get(cmd) ||
    client.commands.find((a) => a.aliases && a.aliases.includes(cmd));

  const PermissionsFlags = [
    "ADMINISTRATOR",
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
  ];

  try {
    if (command.permissions.length) {
      let invalidPermissionsFlags = [];
      for (const permission of command.permissions) {
        if (!PermissionsFlags.includes(permission)) {
          message.reply(
            `Ouve um problema na execução do comando \`${message.content}\` \nespere algum tempo até que o problema seja resolvido`
          );
          return console.log(`Invalid Permissions: ${permission}`);
        }

        if (!message.member.hasPermission(permission)) {
          invalidPermissionsFlags.push(permission);
        }
      }

      if (invalidPermissionsFlags.length) {
        const noPermissionEmbed = new MessageEmbed()
          .setColor("RED")
          .setTitle("❌ Sem Permissão")
          .setDescription("Você não tem permissão para isso!")
          .addField(
            "Permissão Necessária",
            `\`${invalidPermissionsFlags
              .map(
                (value) => `${value[0] + value.slice(1).replace(/_/gi, " ")}`
              )
              .join(", ")}\``
          )
          .setFooter(message.author.username, message.author.avatarURL())
          .setTimestamp();

        return message.channel.send(noPermissionEmbed);
      }
    }
  } catch (e) {
    let erroEmbed = new MessageEmbed()
      .setColor("RED")
      .setTitle("❌ Comando Desconhecido")
      .setDescription(
        `Use o comando \`${prefix}help\` para exibir a lista inteira de comandos`
      )
      .setTimestamp()
      .setFooter(message.author.username, message.author.avatarURL());
    message.channel.send(erroEmbed);
  }

  if (command) command.execute(client, message, args, Discord, cmd);
});
