export {};
const { SlashCommandBuilder } = require('@discordjs/builders');

process.chdir(__dirname);
import { MapSelection } from "../playqueue/mapSelection";
import { QueueService } from "../services/queueService";
import { GuidValue } from "../types/guid";
import { StringUtils } from "../utilities/stringUtils";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Join the queue in the current channel'),
	async execute(interaction) {
        // This is deferred just in case it goes over 3 seconds in execution before the first reply
        await interaction.deferReply();

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

        const queueId: GuidValue = QueueService.getQueueIdFromChannelId(interaction.channelId);

        if(!QueueService.queueIsJoinable(queueId))
        {
            await interaction.editReply("The queue in this channel cannot be joined!");
            return;
        }

        QueueService.joinQueue(queueId, interaction.user.id);
      
        const gamemode: string = QueueService.getQueueGameMode(queueId);
        const playersNeeded: number = QueueService.getPlayersNeeded(queueId);

        if(playersNeeded != 0)
        {

            const queueMemberIds = QueueService.getQueueMemberIds(queueId);
            let members = await interaction.guild.members.fetch({ user: queueMemberIds, withPresences: false });
            let queueMemberNicknames = members.map(i => i.displayName);

            await interaction.editReply(`${StringUtils.MemberNameListToString(queueMemberNicknames)} need **${playersNeeded}** more players in the ${gamemode} queue! Type \`/queue\` to join!`);
            return;
        }
        else
        {
            let startQueueInteraction = QueueService.getQueueInteraction(queueId);
            await interaction.editReply("Queue is now full! Starting...");

            let mapSelection = new MapSelection(startQueueInteraction);
            await mapSelection.createMapSelectionChoiceDropdown();
        }
	},
};