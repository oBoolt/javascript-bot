const dPrefix = require('../../config.json').prefix;
const { errorbuilder }  = require('../../handlers/functions')
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);

module.exports = {
    name: 'volume',
    permissions: ['SEND_MESSAGES'],
    description: 'Muda o volume',
    usage: "<number>",
    execute: async (client, message, args, Discord, cmd) => {
        try {
            const dPrefix = require('../../config.json').prefix;
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

            // DJ ROLE
            const djRoleCheck = await db.fetch(`djRole_${message.guild.id}`);
            const getDjRole = await db.get(`djRole_${message.guild.id}`);
            const djRole = message.guild.roles.cache.get(getDjRole);

            if (!djRoleCheck) return message.channel.send(`O \`cargo DJ\` não está configurado \nUse \`${prefix}setup djRole @role-name\``);
            if (!message.member.voice.channel) return message.channel.send('Você precisa estar em um canal de voz para executar esse comando!');

            if (message.member.roles.cache.has(djRole.id)) {
                if (!args[0]) return message.channel.send('Por favor coloque um valor');
                if (isNaN(args[0])) return message.channel.send(`\`${args[0]}\` não é um número`);
                client.distube.setVolume(message, args[0]);
                message.channel.send(`O volume da fila foi definida para: \`${args[0]}%\``);
                message.delete();
            } else return message.channel.send("Você não tem o cargo de DJ");
        } catch (e) {
            errorbuilder(e, message);
        }
    },
}
