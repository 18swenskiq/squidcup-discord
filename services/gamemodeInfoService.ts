import { QueueMode } from "../types/queueMode";

export abstract class GamemodeInfoService {
    // TODO: Is there any real benefit gained from *not* hardcoding this?
    public static GetCollectionIdForQueueMode(input: QueueMode): string {
        switch(input)
        {
            case QueueMode.Aim:
                return "678359554";
            case QueueMode.Wingman:
                return "2747675401";
            case QueueMode.Thirdwheel:
                return "2747675401";
        }
    }
}