// Require the necessary discord.js classes
import fs from 'fs';
import path from 'path';
const { Client, Collection, Intents } = require('discord.js');

const configPath = path.resolve(__dirname, "cfg/config.json");
const { token } = require(configPath);

console.log("-----SquidCup Discord Bot-----");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commandsPath = path.resolve(__dirname, "commands/");

client.commands = new Collection();
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log("Loading commands...");
for (const file of commandFiles) {
	const command = require(`${commandsPath}/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with your client's token
client.login(token);
