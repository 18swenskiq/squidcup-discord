// Require the necessary discord.js classes
import fs from 'fs';
import path from 'path';
const { Client, Collection, Intents } = require('discord.js');

const configPath = path.resolve(__dirname, "cfg/config.json");
const { token } = require(configPath);

console.log("-----SquidCup Discord Bot-----");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Set up events
const eventsPath = path.resolve(__dirname, "events/");

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
console.log(`Loading ${eventFiles.length} events...`);

for (const file of eventFiles) {
	const event = require(`${eventsPath}/${file}`);
	if (event.once) {
		client.once(event.name, (...args: any) => event.execute(...args));
	} else {
		client.on(event.name, (...args: any) => event.execute(...args));
	}
}
console.log("Done loading events");

// Set up Commands
const commandsPath = path.resolve(__dirname, "commands/");

client.commands = new Collection();
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(`Loading ${commandFiles.length} commands...`);
for (const file of commandFiles) {
	const command = require(`${commandsPath}/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}
console.log("Done loading commands");

// Login to Discord with your client's token
client.login(token);
