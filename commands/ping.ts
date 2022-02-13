export {};
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('For testing'),
	async execute(interaction: any) {
		await interaction.reply("This doesn't do anything");
	},
};
