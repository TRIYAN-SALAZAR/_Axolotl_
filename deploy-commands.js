const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

const { clientId, guildId, BOT_TOKEN } = process.env;
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFilesOrFolders = fs.readdirSync(commandsPath);

for (const fileOrFolder of commandFilesOrFolders) {
    const fullPath = path.join(commandsPath, fileOrFolder);
    let commandFiles;

    if (fs.statSync(fullPath).isDirectory()) {
        commandFiles = fs.readdirSync(fullPath).filter(file => file.endsWith('.js')).map(file => path.join(fullPath, file));
    } else if (fullPath.endsWith('.js')) {
        commandFiles = [fullPath];
    } else {
        continue;
    }

    for (const file of commandFiles) {
        console.log(file);
        const command = require(file);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${file} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(BOT_TOKEN);

// and deploy your commands!    
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        console.log('----------------\n'+commands );
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
