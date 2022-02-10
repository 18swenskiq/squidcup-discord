process.chdir(__dirname);
import { Queue, QueueState } from "../playqueue/queue";
import { ChannelSnowflake } from "../types/channelSnowflake";
import { Guid, GuidValue } from "../types/guid";
import { MapSelectionMode } from "../types/mapSelectionMode";
import { QueueMode } from "../types/queueMode";
import { UserSnowflake } from "../types/userSnowflake";

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

    public static playerIsInAQueue(user: UserSnowflake): boolean {
        if(this.activeQueues.find(i => i.isUserInQueue(user)))
        {
            return true;
        }
        return false;
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

    public static getQueueIdFromChannelId(channel: ChannelSnowflake): GuidValue {
        const queue = this.activeQueues.find(i => i.GetChannel() == channel);
        return queue.GetId();
    }

    // Queue-flow related code
    public static async SetupAllPickRandomVeto(queueId: GuidValue): Promise<void> {
        // TODO: Check timeout
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        const queueGamemode = queue.GetQueueType();

        let workshopUrl: string = "";

        switch (queueGamemode) {
            case QueueMode.Aim:
                workshopUrl = "dummy 1v1 url";
                break;
            case QueueMode.Wingman:
                workshopUrl = "https://steamcommunity.com/sharedfiles/filedetails/?id=2747675401";
                break;
            case QueueMode.Thirdwheel:
                workshopUrl = "dummy 3v3 url";
                break;
        }

        await queue.GetInteraction().followUp(`Map List for ${queueGamemode} here: <${workshopUrl}>`);
        await queue.GetInteraction().followUp("Use `/vote <mapname>` to vote for what map you want!");

        // Next I need to build the /vote command, and make sure it checks the user is in a queue, the queue map selection mode is AllPickRandomVeto, and it is in the "MapSelection" phase

    }
}