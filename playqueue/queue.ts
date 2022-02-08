process.chdir(__dirname);
import { QueueService } from "../services/queueService";
import { ChannelSnowflake } from "../types/channelSnowflake";
import { UserSnowflake } from "../types/userSnowflake";
import { GuidValue } from "../types/guid";
import { MessageEmbed } from "discord.js";
import { StringUtils } from "../utilities/stringUtils";

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
    private QueueInteraction: any;
    private PlayersNeeded: number;

    constructor(interaction: any, id: GuidValue, queueType: string)
    {
        this.State = QueueState.Initializing;
        this.Id = id;
        this.Owner = <UserSnowflake>interaction.user.id;
        this.Channel = <ChannelSnowflake>interaction.channelId;
        this.QueueType = queueType;

        switch(this.QueueType)
        {
            case "1v1":
                this.PlayersNeeded = 1;
                break;
            case "2v2":
                this.PlayersNeeded = 3;
                break;
            case "3v3":
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

    public createMapModeSelectionChoiceDropdown = async(): Promise<void> => 
    {
        
    }
}