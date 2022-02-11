import { Queue, QueueState } from "../playqueue/queue";
import { GamemodeInfoService } from "../services/gamemodeInfoService";
import { QueueService } from "../services/queueService";
import { SteamApiService } from "../services/steamAPIService";
import { MapData } from "../types/mapData";
import { MapSelectionMode } from "../types/mapSelectionMode";
import { QueueMode } from "../types/queueMode";

export {};
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription("Vote for a map by providing the name as an input. Will do my best to guess what you meant")
        .addStringOption(option => 
            option.setName("mapinput")
                .setDescription("The name of the map (keep it simple!)")
                .setRequired(true)),
        async execute(interaction) {
            await interaction.deferReply();
            if (!QueueService.isPlayerIsInAQueue(interaction.user.id))
            {
                await interaction.editReply(`You are not currently in a queue!`);
                return;
            }

            const queueId = QueueService.getQueueFromUserSnowflake(interaction.user.id);

            if (QueueService.getQueueState(queueId) != QueueState.MapSelection)
            {
                await interaction.editReply(`The queue is not currently in a voting state!`);
                return;
            }

            // TODO: Might need to worry about other cases for voting later... Think with AllPickRandomVeto we will say that's the only one to vote on for now
            if(QueueService.getMapSelectionMode(queueId) != MapSelectionMode.AllPickRandomVeto)
            {
                await interaction.editReply(`The /vote command cannot be used at this time`);
                return;
            }

            // Check if user has already voted
            if(QueueService.hasUserMapVoted(queueId, interaction.user.id))
            {
                // May want to consider modifying this to allow changing your vote
                await interaction.editReply(`You have already voted for a map!`);
                return;
            }

            // If all of these cases pass, then we can test the input
            const collectionId = GamemodeInfoService.GetCollectionIdForQueueMode(<QueueMode>QueueService.getQueueGameMode(queueId));
            const maps = await SteamApiService.GetMapsFromCollection(collectionId);
            const inputMap: string = interaction.options.getString('mapinput');

            const matchingMaps = MapData.GetMatchingMapNames(maps, inputMap);

            if (matchingMaps.length == 0)
            {
                await interaction.editReply("No map was found matching that name. Please try again");
                return;
            }
            else if (matchingMaps.length == 1)
            {
                QueueService.AddUserVote(queueId, interaction.user.id, matchingMaps[0]);
                await interaction.editReply(`${interaction.member.displayName} voted for ${matchingMaps[0].GetWorkshopTitle()}`);
                return;
            }
            // Situation: Multiple maps matched. We are going to have to force the user to pick one
            else
            {
                await interaction.editReply("Sorry, not implemented");
                return;
            }
        }
}