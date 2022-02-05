export {};
import fs from 'fs';
import path from 'path';
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const configPath = path.resolve(__dirname, "cfg/config.json");

const { clientId, guildId, token } = require(configPath);

console.log("-----DEPLOYING SLASH COMMANDS-----");

const commands = [];
const commandsPath = path.resolve(__dirname, "commands/");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(`Registering ${commandFiles.length} commands...`);
for (const file of commandFiles) {
	const command = require(`${commandsPath}/${file}`);
	console.log(`Registering ${command.data.name} command`)
	commands.push(command.data.toJSON());
}
	
const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.then(() => console.log("-----END DEPLOYING SLASH COMMANDS-----"))
	.then(() => console.log("\n"))
	.catch(console.error);