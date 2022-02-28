const { MessageEmbed } = require('discord.js');
const { errorbuilder } = require('../../handlers/functions')
const dPrefix = require('../../config.json').prefix;
const { Database } = require('quickmongo');
const QuickMongoURL = require('../../config.json').QuickMongoURL;
const db = new Database(QuickMongoURL);
module.exports = {
    name: "setup",
    description: "Abre o menu de configurações",
    permissions: ['SEND_MESSAGES', 'MANAGE_GUILD', 'MANAGE_CHANNELS'],
    usage: "<section> [value]",
    execute: async (client, message, args, Discord, cmd) => {
        try {
            let prefix = await db.get(`prefix_${message.guild.id}`) ? await db.get(`prefix_${message.guild.id}`) : dPrefix;

            let choice = args[0];
            const noChoiceEmbed = new MessageEmbed()
                .setColor("RED")
                .setTitle("Sem Escolhas Selecionadas")
                .setDescription("Por favor selecione a seção que você deseja configurar")
                .addFields(
                    { name: "Usage", value: `\`${prefix}setup <section> [value]\`` },
                    { name: "Exemplo", value: `\`${prefix}setup autoRole on\` \n\`${prefix}setup welcomeChannel #channel-name\`` },
                    { name: "\u200B", value: "__Canais__" },
                    { name: "👋 Canal de Bem-Vindo", value: ">>> section: `welcomeChannel`", inline: true },
                    { name: "😭 Canal de Saída", value: ">>> section: `leaveChannel`", inline: true },
                    { name: "📁 Canal de Log", value: ">>> section: `logChannel`", inline: true },
                    { name: "\u200B", value: "__Cargos__" },
                    { name: "👑 Cargo Automático", value: ">>> section: `autoRole`", inline: true },
                    { name: "👤 Cargo Membro", value: ">>> section: `memberRole`", inline: true },
                    { name: "🔇 Cargo Mute", value: ">>> section: `muteRole`", inline: true },
                    { name: "🎵 Cargo DJ", value: ">>> section: `djRole`", inline: false },
                    { name: "\u200B", value: "__Outros__" },
                    { name: "⚙️ Configuração", value: ">>> section: `config` \nuse essa seção para mostar a configuração atual", inline: true },
                )
                .setFooter(message.author.username, message.author.avatarURL())
                .setTimestamp();

            if (!choice) return message.channel.send(noChoiceEmbed);

            // Variaveis
            // welcomeChannel
            const getWelcomeChannel = await db.get(`welcome_${message.guild.id}`);
            const welcomeChannelCheck = await db.fetch(`welcome_${message.guild.id}`);
            let welcomeChannelStatus;
            if (welcomeChannelCheck) {
                welcomeChannelStatus = `<#${getWelcomeChannel}>`;
            } else welcomeChannelStatus = '`Canal Não Configurado`';
            // leaveChannel
            const getLeaveChannel = await db.get(`leave_${message.guild.id}`);
            const leaveChannelCheck = await db.fetch(`leave_${message.guild.id}`);
            let leaveChannelStatus;
            if (leaveChannelCheck) {
                leaveChannelStatus = `<#${getLeaveChannel}>`;
            } else leaveChannelStatus = '`Canal não Configurado`';
            // memberRole
            const getMemberRole = await db.get(`memberRole_${message.guild.id}`);
            const memberRoleCheck = await db.fetch(`memberRole_${message.guild.id}`);
            let memberRoleStatus
            if (memberRoleCheck) {
                memberRoleStatus = `<@&${getMemberRole}>`;
            } else memberRoleStatus = '`Cargo não Configurado`';
            // muteRole
            const getMuteRole = await db.get(`muteRole_${message.guild.id}`);
            const muteRoleCheck = await db.fetch(`muteRole_${message.guild.id}`);
            let muteRoleStatus;
            if (muteRoleCheck) {
                muteRoleStatus = `<@&${getMuteRole}>`;
            } else muteRoleStatus = '`Cargo não configurado`';
            // djRole
            const getDjRole = await db.get(`djRole_${message.guild.id}`);
            const djRoleCheck = await db.fetch(`djRole_${message.guild.id}`);
            let djRoleStatus;
            if (djRoleCheck) {
                djRoleStatus = `<@&${getDjRole}>`;
            } else djRoleStatus = '`Cargo não configurado`';
            // autoRole
            const autoRoleCheck = await db.fetch(`autoRole_${message.guild.id}`);
            let autoRoleStatus;
            if (autoRoleCheck) {
                autoRoleStatus = '`🟢 (ON)`';
            } else autoRoleStatus = '`🔴 (OFF)`';
            // logChannel
            const getLogChannel = await db.fetch(`log_${message.guild.id}`);
            const logChannelCheck = await db.fetch(`log_${message.guild.id}`);
            let logChannelStatus;
            if (logChannelCheck) {
                logChannelStatus = `<#${getLogChannel}>`;
            } else logChannelStatus = '`Canal não configurado`';

            switch (choice.toLowerCase()) {
                case 'config':
                    const configEmbed = new MessageEmbed()
                        .setColor(message.guild.me.displayHexColor)
                        .setTitle("Configurações")
                        .setDescription("Configurações do servidor atual")
                        .addFields(
                            { name: "Usage", value: `\`${prefix}setup <section> [value]\`` },
                            { name: "Exemplo", value: `\`${prefix}setup autoRole on\` \n\`${prefix}setup welcomeChannel #channel-name\`` },
                            { name: "\u200B", value: "__Canais__" },
                            { name: "👋 Canal de Bem-Vindo", value: `>>> ${welcomeChannelStatus}`, inline: true },
                            { name: "😭 Canal de Saída", value: `>>> ${leaveChannelStatus}`, inline: true },
                            { name: "📁 Canal de Log", value: `>>> ${logChannelStatus}`, inline: true },
                            { name: "\u200B", value: "__Cargos__" },
                            { name: "👑 Cargo Automático", value: `>>> ${autoRoleStatus}`, inline: true },
                            { name: "👤 Cargo Membro", value: `>>> ${memberRoleStatus}`, inline: true },
                            { name: "🔇 Cargo Mute", value: `>>> ${muteRoleStatus}`, inline: true },
                            { name: "🎵 Cargo DJ", value: `>>> ${djRoleStatus}`, inline: false },
                        )
                        .setFooter(message.author.username, message.author.avatarURL())
                        .setTimestamp();
                    message.channel.send(configEmbed);
                    break;
                case 'welcomechannel':
                    if (args[1].toLowerCase() === "off") {
                        db.delete(`welcome_${message.guild.id}`);
                        return message.channel.send("O canal de entrada foi removido");
                    }
                    const welcomeChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                    if (!welcomeChannel) return message.channel.send(`\`${args[1]}\` não é um canal válido!`);
                    await db.set(`welcome_${message.guild.id}`, welcomeChannel.id);
                    message.channel.send(`${welcomeChannel} agora é o canal de boas vindas`);
                    break;
                case 'leavechannel':
                    if (args[1].toLowerCase() === "off") {
                        db.delete(`leave_${message.guild.id}`);
                        return message.channel.send("O canal de saída foi removido");
                    }
                    const leaveChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                    if (!leaveChannel) return message.channel.send(`\`${args[1]}\` não é um canal válido!`);
                    await db.set(`leave_${message.guild.id}`, leaveChannel.id);
                    message.channel.send(`${leaveChannel} agora é o canal de saídas`);
                    break;
                case 'logchannel':
                    if (args[1].toLowerCase() === "off") {
                        db.delete(`log_${message.guild.id}`);
                        return message.channel.send("O canal de log foi removido");
                    }
                    const logChannel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                    if (!logChannel) return message.channel.send(`\`${args[1]}\` não é um canal válido!`);
                    await db.set(`log_${message.guild.id}`, logChannel.id);
                    message.channel.send(`${logChannel} agora é o canal de log`);
                    break;
                case 'memberrole':
                    if (args[1].toLowerCase() === "off") {
                        db.delete(`memberRole_${message.guild.id}`);
                        return message.channel.send("O cargo de membro foi removido")
                    }
                    const memberRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                    if (!memberRole) return message.channel.send(`\`${args[1]}\` não é um cargo válido!`);
                    await db.set(`memberRole_${message.guild.id}`, memberRole.id);
                    message.channel.send(`${memberRole} agora é o cargo de membro`);
                    break;
                case 'muterole':
                    if (args[1].toLowerCase() === "off") {
                        db.delete(`muteRole_${message.guild.id}`);
                        return message.channel.send("O cargo de mute foi removido")
                    }
                    const muteRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                    if (!muteRole) return message.channel.send(`\`${args[1]}\` não é um cargo válido!`);
                    await db.set(`muteRole_${message.guild.id}`, muteRole.id)
                    message.channel.send(`${muteRole} agora é o cargo de mute`);
                    break;
                case 'djrole':
                    if (args[1].toLowerCase() === "off") {
                        db.delete(`djRole_${message.guild.id}`);
                        return message.channel.send("O cargo DJ foi removido")
                    }
                    const djRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                    if (!djRole) return message.channel.send(`\`${args[1]}\` não é um cargo válido!`);
                    await db.set(`djRole_${message.guild.id}`, djRole.id);
                    message.channel.send(`${djRole} agora é o cargo de DJ`);
                    break;
                case 'autorole':
                    if (!args[1]) return message.channel.send("Por favor especifique entre on/off");
                    if ((memberRoleStatus === '`Cargo não Configurado`')) return message.channel.send("Por favor configure o **Cargo de Membro** antes de usar o Cargo Automático");
                    if (args[1].toLowerCase() === "on") {
                        if ((await db.fetch(`autoRole_${message.guild.id}`)) === null) {
                            await db.set(`autoRole_${message.guild.id}`, true);
                            return message.channel.send("O `Cargo Automático` agora está ligado");
                        } else if ((await db.fetch(`autoRole_${message.guild.id}`)) === false) {
                            await db.set(`autoRole_${message.guild.id}`, true);
                            return message.channel.send("O `Cargo Automático` agora está ligado");
                        } else return message.channel.send("O `Cargo Automático` já está ligado");
                    }
                    if (args[1].toLowerCase() === "off") {
                        if (await db.fetch(`autoRole_${message.guild.id}`) === true) {
                            await db.delete(`autoRole_${message.guild.id}`);
                            return message.channel.send("O `Cargo Automático` agora está desligado");
                        } else return message.channel.send("O `Cargo Automático` já está desligado");
                    }
                    break;
            }
        } catch (e) {
            errorbuilder(e, message);
        }
    },
};