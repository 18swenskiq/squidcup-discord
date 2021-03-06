import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { QueueState } from "../playqueue/queue";
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
                await interaction.editReply(`You have already voted for a map!`);
                return;
            }

            // Check if we are already waiting on their vote
            if(QueueService.isUserVotePending(queueId, interaction.user.id)) {
                await interaction.editReply(`Please select an item in the dropdown`);
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
                await interaction.editReply(`${interaction.member.displayName} voted for **${matchingMaps[0].GetWorkshopTitle()}**`);
                return;
            }
            // Situation: There are more than 5 matches. That's too many matches, they need to be more specific
            else if (matchingMaps.length > 5)
            {
                await interaction.deleteReply();
                await interaction.followUp({ content: `Too many results matched your vote. Please be more specific!`, ephemeral: true});
                return;
            }
            // Situation: Between 2-4 matches detected. We are going to have to give the user a dropdown for them to pick from
            else
            { 
                QueueService.AddUserVotePending(queueId, interaction.user.id);

                const mapChoices =  matchingMaps.map(function(m) {
                    let info = {"label": m.GetWorkshopTitle(),
                                "description": m.GetDescription(),
                                "value": m.GetPublishedFileId()}
                    return info;
                });
                mapChoices.push({"label": "None of these", "description": "/vote for a completely new map", "value": "quit"});

                // Create the dropdown option for the queue leader to choose the map selection mode
                const mapSelectionRow = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`specifymapvote_${queueId}`)
                        .setPlaceholder('Select a Map')
                        .addOptions(mapChoices)
                );

                await interaction.deleteReply();
                await interaction.followUp({ content: 'Please specify your vote in this dropdown', components: [mapSelectionRow], ephemeral: true})
                return;
            }
        }
}