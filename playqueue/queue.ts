import { ProgramDataLists } from "../services/programDataLists";
import { ChannelSnowflake } from "../types/channelSnowflake";
import { UserSnowflake } from "../types/userSnowflake";
import { GuidValue } from "../types/guid";

enum QueueState {
    Initializing,
    SearchingForPlayers,
    MapModeSelection,
    MapSelection,
    ServerLoading,
    GameLive,
    Cancelled,
}

export class Queue {
    private Id: GuidValue;
    private Owner: UserSnowflake;
    private StartTime: Date;
    private QueueType: string;
    private Members: UserSnowflake[];
    private State: QueueState;
    private Channel: ChannelSnowflake;

    constructor(owner: UserSnowflake, channel: ChannelSnowflake, id: GuidValue, queueType: string)
    {
        this.State = QueueState.Initializing;
        this.Id = id;
        this.Owner = owner;
        this.Channel = channel;
        this.QueueType = queueType;
        this.StartTime = new Date();
        this.Members = [owner];
        this.State = QueueState.SearchingForPlayers;
        ProgramDataLists.createNewQueue(this);
    }

    public GetOwner(): UserSnowflake {
        return this.Owner;
    }

    public UserInQueue(id: UserSnowflake): boolean {
        if (this.Members.includes(id))
        {
            return true;
        }
        return false;
    }
}