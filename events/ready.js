const client = require('../main');
const chalk = require('chalk');

client.on('ready', () => {
    const prefix = require('../config.json').prefix;
    console.log(chalk.green.bold(`Conectado como: ${client.user.tag}`));
    let totalUsers = client.guilds.cache.reduce((acc, value) => acc + value.memberCount, 0)
    var activities = [`${client.guilds.cache.size} servers`, `${totalUsers} users!`], i = 0;
    setInterval(() => client.user.setActivity(`${prefix}help | ${activities[i++ % activities.length]}`, { type: "WATCHING" }), 5000)
});