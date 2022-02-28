const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const { Database } = require("quickmongo");
const MongoURL = require("../../config.json").QuickMongoURL;
const db = new Database(MongoURL);
const { timeout, errorbuilder } = require("../../handlers/functions");
module.exports = {
  name: "help",
  description: "Mostra o menu de ajuda",
  permissions: ["SEND_MESSAGES"],
  usage: "[command_name]",
  aliases: ["ajuda"],
  execute: async (client, message, args, Discord, cmd) => {
    try {
      const dPrefix = require("../../config.json").prefix;
      let prefix = (await db.get(`prefix_${message.guild.id}`))
        ? await db.get(`prefix_${message.guild.id}`)
        : dPrefix;
      if (!args[0]) {
        let categories = [];

        fs.readdirSync("./commands/").forEach((dir) => {
          const commands = fs
            .readdirSync(`./commands/${dir}/`)
            .filter((file) => file.endsWith(".js"));

          const cmds = commands.map((command) => {
            let file = require(`../../commands/${dir}/${command}`);

            if (!file.name) return "`Comando em Progresso`";

            let name = file.name.replace(".js", "");

            return `\`${name}\``;
          });

          let data = new Object();

          data = {
            name: dir.toUpperCase(),
            value: cmds.length === 0 ? "Em progresso" : cmds.join(" "),
            inline: false,
          };

          categories.push(data);
        });

        const helpEmbed = new MessageEmbed()
          .setColor(message.guild.me.displayHexColor)
          .setTitle("Menu de ajuda")
          .addFields(categories)
          .setDescription(
            `Use \`${prefix}help\` com o nome de um comando para conseguir informações mais precisas \nExemplo \`${prefix}help ping\``
          )
          .setFooter(message.author.username, message.author.avatarURL())
          .setTimestamp();
        message.channel.send(helpEmbed);
        // timeout(message, helpEmbed);
        return;
      } else {
        const command =
          client.commands.get(args[0].toLowerCase()) ||
          client.commands.find(
            (c) => c.aliases && c.aliases.includes(args[0].toLowerCase())
          );

        if (!command) {
          const noCommandEmbed = new MessageEmbed()
            .setTitle(`Commando não encontrado`)
            .setDescription(
              `Use \`${prefix}help\` para listar a lista de comandos`
            )
            .setColor(message.guild.me.displayHexColor)
            .setFooter(message.author.username, message.author.avatarURL())
            .setTimestamp();
          return message.channel.send(noCommandEmbed);
        }

        const helpMenuEmbed = new MessageEmbed()
          .setTitle(`Informações do comando`)
          .addFields(
            {
              name: "Comando",
              value: command.name ? `\`${command.name}\`` : "Comando sem nome",
            },
            {
              name: "Aliases",
              value: command.aliases
                ? `\`${command.aliases.join("` `")}\``
                : "Sem aliases",
            },
            {
              name: "Usage",
              value: command.usage
                ? `\`${prefix}${command.name} ${command.usage}\``
                : `\`${prefix}${command.name}\``,
            },
            {
              name: "Permissões Necessarias",
              value: command.permissions
                ? `\`${command.permissions
                    .map(
                      (value) =>
                        `${value[0] + value.slice(1).replace(/_/gi, " ")}`
                    )
                    .join(", ")}\``
                : `\`Sem Permissão\``,
            },
            {
              name: "Descrição",
              value: `${command.description}`
                ? `\`${command.description}\``
                : "Sem descrição",
            }
          )
          .setColor(message.guild.me.displayHexColor)
          .setFooter(message.author.username, message.author.avatarURL())
          .setTimestamp();
        return message.channel.send(helpMenuEmbed);
      }
    } catch (e) {
      errorbuilder(e, message);
    }
  },
};
