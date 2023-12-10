const Discord = require('discord.js');
const Config = require('./config.json');
const dotenv = require('dotenv');

const fs = require('node:fs');
const path = require('node:path');

//creacion del bot
const client = new Discord.Client(
{ 
  intents:
  [
    Discord.GatewayIntentBits.Guilds,
    // Discord.GatewayIntentBits.GuildMessages
  ]
});

// para caragar los archivos de los comandos
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
const { cooldowns } = client;

if (!cooldowns.has(command.data.name)) {
	cooldowns.set(command.data.name, new Collection());
}

const now = Date.now();
const timestamps = cooldowns.get(command.data.name);
const defaultCooldownDuration = 3;
const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

if (timestamps.has(interaction.user.id)) {
	const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

	if (now < expirationTime) {
		const expiredTimestamp = Math.round(expirationTime / 1000);
		return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
	}
	timestamps.set(interaction.user.id, now);
	setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
	
}


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


client.login(Config.BOT_TOKEN);