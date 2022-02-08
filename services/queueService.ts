process.chdir(__dirname);
import { Queue, QueueState } from "../playqueue/queue";
import { ChannelSnowflake } from "../types/channelSnowflake";
import { GuidValue } from "../types/guid";
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

    public static queueIsJoinable(queueId: GuidValue): boolean {
        // TODO: Return an object containing {boolean, string}, with the string being the reason its not joinable
        const queue = this.activeQueues.find(i => i.GetId() == queueId);
        if (!queue)
        {
            return false;
        }
        if (queue.GetState() != QueueState.SearchingForPlayers)
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

    public static getQueueFromId(queueId: GuidValue): Queue {
        return this.activeQueues.find(i => i.GetId() == queueId);
    }

    public static getQueueIdFromChannelId(channel: ChannelSnowflake): GuidValue {
        const queue = this.activeQueues.find(i => i.GetChannel() == channel);
        return queue.GetId();
    }
}