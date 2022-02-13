process.chdir(__dirname);
import { Queue, QueueState } from "../playqueue/queue";
import { ChannelSnowflake } from "../types/channelSnowflake";
import { Guid, GuidValue } from "../types/guid";
import { MapData } from "../types/mapData";
import { MapSelectionMode } from "../types/mapSelectionMode";
import { QueueMode } from "../types/queueMode";
import { UserSnowflake } from "../types/userSnowflake";
import { GamemodeInfoService } from "./gamemodeInfoService";

export abstract class QueueService {
    private static maxNumberQueues: number = 2;

    private static activeQueues: Queue[] = [];
    
    public static createNewQueue(queue: Queue) : void {
        this.activeQueues.push(queue);
    }

    public static canCreateQueue(newOwner: UserSnowflake): boolean {
        // If there are currently no queues, anyone can make a queue
        if (this.activeQueues.length == 0)
        {
            return true;
        }

        // If we are already at the maximum number of queues, then we can't create a new one no matter what
        if (this.activeQueues.length == this.maxNumberQueues)
        {
            return false;
        }

        const isInQueue = this.activeQueues.find(i => i.isUserInQueue(newOwner));
        if (isInQueue) {
            return false;
        }

        return true;
    }

    public static isQueueInChannel(channel: ChannelSnowflake): boolean {
        if (this.activeQueues.length == 0)
        {
            return false;
        }

        if(this.activeQueues.find(i => i.GetChannel() == channel))
        {
            return true;
        }

        return false;
    }

    public static isPlayerIsInAQueue(user: UserSnowflake): boolean {
        if(this.activeQueues.find(i => i.isUserInQueue(user)))
        {
            return true;
        }
        return false;
    }

    public static getQueueFromUserSnowflake(user: UserSnowflake): GuidValue {
        return this.activeQueues.find(i => i.isUserInQueue(user)).GetId();
    }

    public static doesQueueExist(queueId: GuidValue): boolean {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        if (!queue)
        {
            return false;
        }
        return true;
    }

    public static queueIsJoinable(queueId: GuidValue): boolean {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        if (queue.GetState() != QueueState.SearchingForPlayers)
        {
            return false;
        }
        return true;
    }

    public static queueCanPickMapSelection(queueId: GuidValue): boolean {
        const queue = this.activeQueues.find(i => i.GetId() == queueId)
        if (queue.GetState() != QueueState.MapModeSelection)
        {
            return false;
        }
        return true;
    }

    public static async joinQueue(queueId: GuidValue, user: UserSnowflake): Promise<void> {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        await queue.AddMember(user);
    }

    public static getQueueInteraction(queueId: GuidValue): any {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.GetInteraction();
    }

    public static getQueueGameMode(queueId: GuidValue): string {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.GetQueueType();
    }

    public static getPlayersNeeded(queueId: GuidValue): number {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.GetPlayersNeeded();
    }

    public static getQueueMemberIds(queueId: GuidValue): UserSnowflake[] {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.GetMemberIds();
    }

    public static getQueueState(queueId: GuidValue): QueueState {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.GetState();
    }

    public static getMapSelectionMode(queueId: GuidValue): MapSelectionMode {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.GetMapSelectionMode();
    }

    public static setQueueState(queueId: GuidValue, newState: QueueState): void {
        this.activeQueues.find(i => i.GetId() == queueId).SetState(newState);
    }

    public static setQueueMapSelectionMode(queueId: GuidValue, newMode: MapSelectionMode): void {
        this.activeQueues.find(i => i.GetId() == queueId).SetMapSelectionMode(newMode);
    }

    public static incrementQueueState(queueId: GuidValue): void {
        this.activeQueues.find(i => i.GetId() == queueId).IncrementState();
    }

    public static getQueueFromId(queueId: GuidValue): Queue {
        return this.activeQueues.find(i => i.GetId() == queueId);
    }

    public static isUserVotePending(queueId: GuidValue, userId: UserSnowflake): boolean {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.IsUserVotePending(userId);
    }

    public static RemoveUserVotePending(queueId: GuidValue, userId: UserSnowflake): void {
        this.activeQueues.find(i => i.GetId() == queueId).RemoveUserVotePending(userId);
    }

    public static AddUserVotePending(queueId: GuidValue, userId: UserSnowflake): void {
        this.activeQueues.find(i => i.GetId() == queueId).AddUserVotePending(userId);
    }

    public static getQueueIdFromChannelId(channel: ChannelSnowflake): GuidValue {
        const queue = this.activeQueues.find(i => i.GetChannel() == channel);
        return queue.GetId();
    }

    public static hasUserMapVoted(queueId: GuidValue, userId: UserSnowflake): boolean {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        return queue.UserHasVoted(userId);
    }

    // ------------Queue-flow related code------------
    
    public static async SetupAllPickRandomVeto(queueId: GuidValue): Promise<void> {
        // TODO: Check timeout
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        const queueGamemode = queue.GetQueueType();

        const collectionId = GamemodeInfoService.GetCollectionIdForQueueMode(<QueueMode>queueGamemode);
        const workshopUrl = `https://steamcommunity.com/sharedfiles/filedetails/?id=${collectionId}`;

        await queue.GetInteraction().followUp(`Map List for ${queueGamemode} here: <${workshopUrl}>\nUse \`/vote <mapname>\` to vote for which map you want!`);

        // TODO: Create an embed that we save the interaction of, so that it can be edited

    }

    public static AddUserVote(queueId: GuidValue, userId: UserSnowflake, mapVote: MapData): void {
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        queue.CreateNewMapVote(userId, mapVote.GetPublishedFileId());
    }
}