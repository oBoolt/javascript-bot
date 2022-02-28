const fs = require('fs');
const ascii = require('ascii-table');
let table = new ascii("Commands");
table.setHeading('Commands', "Status");

module.exports = client => {
    fs.readdirSync('./commands/').forEach(dir => {
        const commands = fs.readdirSync(`./commands/${dir}`).filter(files => files.endsWith('.js'));

        for (let files of commands) {
            let command = require(`../commands/${dir}/${files}`);

            if (command.name) {
                client.commands.set(command.name, command);
                table.addRow(files, 'Working');
            } else {
                table.addRow(files, 'Not Working');
                continue;
            }
        }
    });
    console.log(table.toString());

    fs.readdirSync('./events/').forEach((file) => {
        const events = fs.readdirSync('./events/').filter((files) => files.endsWith('.js'));

        for (let files of events) {
            let get = require(`../events/${files}`);

            if (get.name) {
                client.events.set(get.name, get);
            } else {
                continue;
            }
        }
    });
};