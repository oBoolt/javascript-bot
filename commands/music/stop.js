const dPrefix = require('../../config.json').prefix;
const { Database } = require('quickmongo');
const MongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(MongoURL);

module.exports = {
    name: 'stop',
    permissions: ['SEND_MESSAGES'],
    description: 'Para de tocar música e sai da chamada',
    execute: async (client, message, args, Discord, cmd) => {
        const dPrefix = require('../../config.json').prefix;
        let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

        // DJ ROLE
        const djRoleCheck = await db.fetch(`djRole_${message.guild.id}`);
        const getDjRole = await db.get(`djRole_${message.guild.id}`);
        const djRole = message.guild.roles.cache.get(getDjRole);

        if (!djRoleCheck) return message.channel.send(`O \`cargo DJ\` não está configurado \nUse \`${prefix}setup djRole @role-name\``);
        if (!message.member.voice.channel) return message.channel.send('Você precisa estar em um canal de voz para executar esse comando!');

        if (message.member.roles.cache.has(djRole.id)) {
            let queue = await client.distube.getQueue(message);

            if (queue) {
                client.distube.stop(message)
                message.delete();
            } else if (!queue) {
                return
            }
        }else return message.channel.send("Você não tem o cargo de DJ");
    },
}
