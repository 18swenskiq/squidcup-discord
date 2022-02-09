import { Queue, QueueState } from "../playqueue/queue";
import { QueueService } from "../services/queueService";
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
        QueueService.getQueueInteraction(queueId).editReply(`You selected, \`${interaction.values[0]}\`! Coninuing...`);
        QueueService.getQueueInteraction(queueId).followUp(`Queue leader selected \`${interaction.values[0]}\`!`);
        
    }
}