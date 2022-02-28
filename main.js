const Discord = require('discord.js');
const { Client } = require('discord.js');
const client = new Client({
    disableEveryone: false,
    restTimeOffset: 0,
    messageCacheMaxSize: 10,
    restWsBridgetimeout: 100,
    messageCacheLifetime: 60,
    fetchAllMembers: false,
    shards: "auto",
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    ws: {
        intents: [
            'GUILDS',
            'GUILD_MEMBERS',
            'GUILD_MESSAGES',
            'GUILD_MESSAGES',
            'GUILD_VOICE_STATES',
            'GUILD_MESSAGE_REACTIONS']
    }
});
const config = require('./config.json');

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

module.exports = client;

["handler", "distube-handler"].forEach((handler) => {
    require(`./handlers/${handler}`)(client);
});

client.login(config.token);