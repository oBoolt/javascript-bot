const client = require('../main');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { Database } = require('quickmongo');
const QuickMongoURL = require('../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);

client.on('guildMemberRemove', async (member) => {
    const leaveChannelCheck = await db.fetch(`leave_${member.guild.id}`);

    let leaveMessageEmbed = new MessageEmbed()
        .setColor("RED")
        .setThumbnail(member.user.displayAvatarURL())
        .setTitle("😭 Adeus")
        .setTimestamp()
        .setDescription(`<@${member.id}> saiu do servidor, até mais`);

    if (leaveChannelCheck) {
        const getLeaveChannel = await db.get(`leave_${member.guild.id}`);
    const leaveChannel = member.guild.channels.cache.get(getLeaveChannel);
    leaveChannel.send(leaveMessageEmbed);
    } else return;
});