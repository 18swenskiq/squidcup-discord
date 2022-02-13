process.chdir(__dirname);
import { QueueService } from "../services/queueService";
import { ChannelSnowflake } from "../types/channelSnowflake";
import { UserSnowflake } from "../types/userSnowflake";
import { GuidValue } from "../types/guid";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { StringUtils } from "../utilities/stringUtils";
import { QueueMode } from "../types/queueMode";
import { MapSelectionMode } from "../types/mapSelectionMode";

export enum QueueState {
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
    private QueueInteraction: CommandInteraction;
    private PlayersNeeded: number;
    private MapSelectionMode: MapSelectionMode;
    private MapVotes: Map<UserSnowflake, string>;
    private VotesPending: UserSnowflake[];

    constructor(interaction: CommandInteraction, id: GuidValue, queueType: string)
    {
        this.State = QueueState.Initializing;
        this.Id = id;
        this.Owner = <UserSnowflake>interaction.user.id;
        this.Channel = <ChannelSnowflake>interaction.channelId;
        this.QueueType = queueType;

        switch(this.QueueType)
        {
            case QueueMode.Aim:
                this.PlayersNeeded = 1;
                break;
            case QueueMode.Wingman:
                this.PlayersNeeded = 3;
                break;
            case QueueMode.Thirdwheel:
                this.PlayersNeeded = 5;
                break;
            default:
                this.PlayersNeeded = Number.MAX_SAFE_INTEGER;
                break;
        }

        this.StartTime = new Date();
        this.Members = [this.Owner];
        this.State = QueueState.SearchingForPlayers;
        this.QueueInteraction = interaction;
        this.MapVotes = new Map<UserSnowflake, string>();
        this.VotesPending = [];
        QueueService.createNewQueue(this);
    }

    public GetChannel(): ChannelSnowflake {
        return this.Channel;
    }

    public GetOwner(): UserSnowflake {
        return this.Owner;
    }

    public isUserInQueue(id: UserSnowflake): boolean {
        if (this.Members.includes(id))
        {
            return true;
        }
        return false;
    }

    public async AddMember(user: UserSnowflake): Promise<void> {
        this.Members.push(user);
        this.PlayersNeeded -= 1;

        let guildMembers = await this.QueueInteraction.guild.members.fetch({ user: this.Members, withPresences: false });
        let memberNicknames = guildMembers.map(i => i.displayName);

        const editedEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${this.QueueType} Queue`)
            .setFields(
                {name: 'Players Needed', value: `${this.PlayersNeeded}`, inline: true},
                {name: 'Players in Queue', value: StringUtils.MemberNameListToString(memberNicknames), inline: true},
            )
            .setTimestamp();

        if(this.PlayersNeeded == 0)
        {
            this.State = QueueState.MapModeSelection;
            await this.QueueInteraction.editReply({components: [], embeds: [editedEmbed]});
        }
        else
        {
            await this.QueueInteraction.editReply({embeds: [editedEmbed]});
        }

    }

    public GetState(): QueueState {
        return this.State;
    }

    public SetState(newState: QueueState): void {
        this.State = QueueState.MapSelection;
    }

    public GetMapSelectionMode() : MapSelectionMode {
        return this.MapSelectionMode;
    }

    public SetMapSelectionMode(newMode: MapSelectionMode): void {
        this.MapSelectionMode = newMode;
        this.State++;
    }

    public IncrementState(): void {
        this.State++;
    }

    public GetInteraction(): any {
        return this.QueueInteraction;
    }

    public GetQueueType(): string {
        return this.QueueType;
    }

    public GetId(): GuidValue {
        return this.Id;
    }

    public GetPlayersNeeded(): number {
        return this.PlayersNeeded;
    }

    public GetMemberIds(): UserSnowflake[] {
        return this.Members;
    }

    public UserHasVoted(userId: UserSnowflake): boolean {
        if(this.MapVotes.get(userId))
        {
            return true;
        }
        return false;
    }

    public CreateNewMapVote(userId: UserSnowflake, mapId: string): void {
        this.MapVotes.set(userId, mapId);
    }

    public AddUserVotePending(userId: UserSnowflake): void {
        this.VotesPending.push(userId);
    }

    public RemoveUserVotePending(userId: UserSnowflake): void {
        this.VotesPending.filter(i => i != userId);
    }

    public IsUserVotePending(userId: UserSnowflake): boolean {
        if(this.VotesPending.find(i => i == userId)) {
            return true;
        }
        return false;
    }
}