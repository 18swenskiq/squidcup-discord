import { GamemodeInfoService } from "../services/gamemodeInfoService";
import { QueueService } from "../services/queueService";
import { SteamApiService } from "../services/steamAPIService";
import { QueueMode } from "../types/queueMode";
import { StringUtils } from "../utilities/stringUtils";

export abstract class SpecifyMapVoteChoice {
    public static OnPress = async(interaction): Promise<void> => {
        const queueId = StringUtils.GetQueueIdFromCustomId(interaction.customId);

        if (QueueService.hasUserMapVoted(queueId, interaction.user.id)) {
            await interaction.editReply("You have already voted!");
            return;
        }

        if (!QueueService.isUserVotePending(queueId, interaction.user.id)) {
            await interaction.editReply("This vote is no longer pending");
            return;
        }

        QueueService.RemoveUserVotePending(queueId, interaction.user.id);

        // Allow the user to /vote again
        if(interaction.values[0] == "quit") {
            await interaction.editReply("Use /vote to select a different map!");
            return;
        }

        const collectionId = GamemodeInfoService.GetCollectionIdForQueueMode(<QueueMode>QueueService.getQueueGameMode(queueId));
        const associatedMap = await SteamApiService.GetMapInfoInCollection(interaction.values[0], collectionId);
        QueueService.AddUserVote(queueId, interaction.user.id, associatedMap);

        await QueueService.getQueueInteraction(queueId).followUp(`${interaction.member.displayName} voted for **${associatedMap.GetWorkshopTitle()}**`)
    }
}