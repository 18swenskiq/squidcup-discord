import { Queue, QueueState } from "../playqueue/queue";
import { QueueService } from "../services/queueService";
import { MapSelectionMode } from "../types/mapSelectionMode";
import { StringUtils } from "../utilities/stringUtils";

export abstract class SelectMapSelectionModeChoice {
    public static OnPress = async(interaction: any): Promise<void> => {
        let queueId = StringUtils.GetQueueIdFromCustomId(interaction.customId);

        if (!QueueService.doesQueueExist(queueId))
        {
            await interaction.editReply("The queue belonging to this choice could not be found!");
            return;
        }

        if (!QueueService.queueCanPickMapSelection(queueId)) {
            await interaction.editReply("The queue is not in a valid state to have the map selection mode chosen");
            return;
        }

        // Set the map selection mode if it was a valid time to do so
        QueueService.setQueueMapSelectionMode(queueId, interaction.values[0]);
        await QueueService.getQueueInteraction(queueId).editReply(`You selected, \`${interaction.values[0]}\`! Coninuing...`);
        await QueueService.getQueueInteraction(queueId).followUp(`Queue leader selected \`${interaction.values[0]}\`!`);


        switch (interaction.values[0]) {
            case MapSelectionMode.SeasonPool:
                await QueueService.getQueueInteraction(queueId).followUp("This queue mode is not yet implemented");
                break;
            case MapSelectionMode.AllPickRandomVeto:
                await QueueService.SetupAllPickRandomVeto(queueId);
                break;
            default:
                QueueService.getQueueInteraction(queueId).followUp("Something isn't right here...");
                break;
        }
        
    }
}