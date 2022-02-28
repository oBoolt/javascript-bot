const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const { errorbuilder } = require('../../handlers/functions');
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);
module.exports = {
    name: "slowmode",
    description: "Ativa/desativa o modo lento no canal",
    permissions: ['SEND_MESSAGES', 'MANAGE_CHANNELS'],
    usage: "[number(s, m, h) or off]",
    aliases: ["slow", "modolento"],
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const dPrefix = require('../../config.json').prefix;
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

            let errorEmbed = new MessageEmbed()
                .setColor("RED")
                .setTitle("❌ Erro");

            let sucessEmbed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("✅ Sucesso");

            if (!args[0]) {
                errorEmbed.addField("Usage", `\`${prefix}slowmode [number(s, m, h) or off]\``);
                message.channel.send(errorEmbed);
                return;
            }
            if (args[0] == "off") {
                message.channel.setRateLimitPerUser(0);
                sucessEmbed.setDescription("O modo lento foi desativado");
                return message.channel.send(sucessEmbed);

            }
            const time = ms(args[0]);

            if (isNaN(time)) {
                errorEmbed.setDescription(`\`${args[0]}\` não é um número!`);
                return message.channel.send(errorEmbed);
            }
            if (time < 1000) {
                errorEmbed.setDescription('Tempo mínimo é `1s`');
                return message.channel.send(errorEmbed);
            }
            if (time > ms('6 hours')) {
                errorEmbed.setDescription('O tempo máximo é `6h`');
                return message.channel.send(errorEmbed);
            }

            message.channel.setRateLimitPerUser(time / 1000);
            sucessEmbed.setDescription(`Modo lento setado para \`${ms(time)}\``);
            message.channel.send(sucessEmbed);
        } catch (e) {
            errobuilder(e, message);
        }
    },
};