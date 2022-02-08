import { MapSelection } from "../playqueue/mapSelection";
import { QueueService } from "../services/queueService";
import { GuidValue } from "../types/guid";
import { StringUtils } from "../utilities/stringUtils";

export abstract class JoinQueueButtonPress {
    public static OnPress = async(interaction: any): Promise<void> => 
    {
        let queueId = this.GetQueueId(interaction.customId);

        // With the button refactor, this should essentially never happen... hopefully
        if (!QueueService.isQueueInChannel(interaction.channelId))
        {
            await interaction.editReply("There is currently no queue in this channel to join!");
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

            const queueMemberIds = QueueService.getQueueMemberIds(queueId);
            let members = await interaction.guild.members.fetch({ user: queueMemberIds, withPresences: false });
            let queueMemberNicknames = members.map(i => i.displayName);

            await interaction.editReply(`Only **${playersNeeded}** more players are needed in the ${gamemode} queue! Hold tight!`);
            return;
        }
        else
        {
            let startQueueInteraction = QueueService.getQueueInteraction(queueId);
            await interaction.editReply("Queue is now full! Starting...");

            let mapSelection = new MapSelection(queueId);
            await mapSelection.createMapSelectionChoiceDropdown();
        }
    }

    private static GetQueueId(customId: string): GuidValue {
        return customId.split("_")[1];
    }
}