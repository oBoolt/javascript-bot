const client = require('../main');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const QuickMongoURL = require('../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);

client.on('guildMemberAdd', async (member) => {
    const autoRoleCheck = await db.fetch(`autoRole_${member.guild.id}`);
    const getMemberRole = await db.get(`memberRole_${member.guild.id}`);
    const memberRole = member.guild.roles.cache.get(getMemberRole);
    const welcomeChannelCheck = await db.fetch(`welcome_${member.guild.id}`);

    if (autoRoleCheck) {
        member.roles.add(memberRole);
        //console.log("Role Add");
    }

    let welcomeMessageEmbed = new MessageEmbed()
        .setColor("BLUE")
        .setThumbnail(member.user.displayAvatarURL())
        .setTitle("👋 Bem Vindo")
        .setTimestamp()
        .setDescription(`Seja muito Bem Vindo(a) <@${member.id}> ao servidor ${member.guild.name}\n Você é o membro **${client.guilds.cache.get(member.guild.id).memberCount}°**`);

    if (welcomeChannelCheck) {
        const getWelcomeChannel = await db.get(`welcome_${member.guild.id}`);
        const welcomeChannel = member.guild.channels.cache.get(getWelcomeChannel);
        welcomeChannel.send(welcomeMessageEmbed);
    } else return;
});