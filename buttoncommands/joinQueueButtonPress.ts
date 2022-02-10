import { QueueService } from "../services/queueService";
import { StringUtils } from "../utilities/stringUtils";
import { MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { QueueMode } from "../types/queueMode";
import { MapSelectionMode } from "../types/mapSelectionMode";

export abstract class JoinQueueButtonPress {
    public static OnPress = async(interaction: any): Promise<void> => 
    {
        let queueId = StringUtils.GetQueueIdFromCustomId(interaction.customId);

        if (!QueueService.doesQueueExist(queueId))
        {
            await interaction.editReply("The associated queue for that button does not exist!");
            return;
        }      

        if (QueueService.playerIsInAQueue(interaction.user.id))
        {
            await interaction.editReply("You are already in a queue!");
            return;
        }

        if(!QueueService.queueIsJoinable(queueId))
        {
            await interaction.editReply("The queue in this channel cannot be joined!");
            return;
        }

        await QueueService.joinQueue(queueId, interaction.user.id);
      
        const gamemode: string = QueueService.getQueueGameMode(queueId);
        const playersNeeded: number = QueueService.getPlayersNeeded(queueId);

        if(playersNeeded != 0)
        {
            await interaction.editReply(`Only **${playersNeeded}** more players are needed in the ${gamemode} queue! Hold tight!`);
            return;
        }
        else
        {
            await interaction.editReply("Queue is now full! Starting...");

            // Create embed showing the teams and ELOs
            const initialEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${QueueService.getQueueGameMode(queueId)} Queue`)
                .addFields(
                    {name: 'Team 1', value: "player names here", inline: true},
                    {name: 'Team 2', value: "player names here", inline: true},
                )
                .setTimestamp();

		    await QueueService.getQueueInteraction(queueId).followUp({embeds: [initialEmbed]});
		    await QueueService.getQueueInteraction(queueId).followUp("<Queue Leader Name> is currently choosing the map selection mode. Please wait...");

            // Create the dropdown option for the queue leader to choose the map selection mode
            const mapSelectionRow = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId(`selectmapselectionmode_${queueId}`)
                        .setPlaceholder('Nothing selected')
                        .addOptions([
                            {
                                label: 'Season Pool Veto',
                                description: 'Veto from the pool of the current season for extra squidcoins!',
                                value: MapSelectionMode.SeasonPool,
                            },
                            {
                                label: 'All Pick/Random Selection',
                                description: 'Everyone picks a map, and a random one is selected',
                                value: MapSelectionMode.AllPickRandomVeto,
                            },
                        ]),
                );		
            await QueueService.getQueueInteraction(queueId).followUp({ content: '<Insert Queue Leader Name here>, please pick a map selection mode!', components: [mapSelectionRow], ephemeral: true});
        }
    }
}