process.chdir(__dirname);
import { Queue } from "../playqueue/queue";
import { UserSnowflake } from "../types/userSnowflake";

export abstract class ProgramDataLists {
    private static maxNumberQueues: number = 2;

    // Queues
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

        const isInQueue = this.activeQueues.find(i => i.UserInQueue(newOwner));
        if (isInQueue) {
            return false;
        }

        return true;
    }
}