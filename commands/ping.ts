import { SteamApiService } from "../services/steamAPIService";

export {};
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('For testing'),
	async execute(interaction) {
		var startTime = Date.now();
		let whatever = await SteamApiService.GetMapsFromCollection("2747675401");
		var endTime = Date.now();
		await interaction.reply(`Took ${(endTime - startTime) / 1000} seconds`);
	},
};
