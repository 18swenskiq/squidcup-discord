export {};
import { SlashCommandBuilder } from "@discordjs/builders";
import { GamemodeInfoService } from "../services/gamemodeInfoService";
import { SteamApiService } from "../services/steamAPIService";
import { QueueMode } from "../types/queueMode";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getmaplist')
		.setDescription('Get the list of maps for a gamemode')
        .addStringOption(option => 
            option.setName('gamesize')
                .setDescription('The gamemode to get the map list for')
                .setRequired(true)
                .addChoice(QueueMode.Aim, QueueMode.Aim)
                .addChoice(QueueMode.Wingman, QueueMode.Wingman)
                .addChoice(QueueMode.Thirdwheel, QueueMode.Thirdwheel)),
	async execute(interaction: any) {
        await interaction.deferReply();
        const gameSize = interaction.options.getString('gamesize');
        const collectionId = GamemodeInfoService.GetCollectionIdForQueueMode(gameSize)
        const maps = await SteamApiService.GetMapsFromCollection(collectionId);

        let mapsList = maps.map(m => m.GetWorkshopTitle());
        mapsList.sort();

        await interaction.editReply(`**${gameSize} Map List: (<https://steamcommunity.com/sharedfiles/filedetails/?id=${collectionId}>)**\n\`\`\`less\n${mapsList.join(', ')}\n\`\`\``)
    }
};