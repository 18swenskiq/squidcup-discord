import { Queue, QueueState } from "../playqueue/queue";
import { QueueService } from "../services/queueService";
import { GuidValue } from "../types/guid";

const { MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js');

export class MapSelection {

    private Queue: Queue;

    constructor(queueId: GuidValue)
    {
		this.Queue = QueueService.getQueueFromId(queueId);
    }

    public createMapSelectionChoiceDropdown = async(): Promise<void> => 
    {
		const initialEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${this.Queue.GetQueueType()} Queue`)
            .addFields(
                {name: 'Team 1', value: "player names here", inline: true},
                {name: 'Team 2', value: "player names here", inline: true},
            )
            .setTimestamp();

		await this.Queue.GetInteraction().followUp({embeds: [initialEmbed]});

		await this.Queue.GetInteraction().followUp("<Queue Leader Name> is currently choosing the map selection mode. Please wait...");

        const mapSelectionRow = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId(`selectmapselectionmode_${this.Queue.GetId()}`)
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Season Pool Veto',
							description: 'Veto from the pool of the current season for extra squidcoins!',
							value: 'season_pool',
						},
						{
							label: 'All Pick/Random Selection',
							description: 'Everyone picks a map, and a random one is selected',
							value: 'all_pick',
						},
					]),
			);		
        await this.Queue.GetInteraction().followUp({ content: '<Insert Queue Leader Name here>, please pick a map selection mode!', components: [mapSelectionRow], ephemeral: true});
    }
}