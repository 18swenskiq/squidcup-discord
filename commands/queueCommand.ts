export {};
const { SlashCommandBuilder } = require('@discordjs/builders');

process.chdir(__dirname);
import { QueueService } from "../services/queueService";
import { GuidValue } from "../types/guid";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Join the queue in the current channel'),
	async execute(interaction) {
        // This is deferred just in case it goes over 3 seconds in execution before the first reply
        await interaction.deferReply();

        if (!QueueService.isQueueInChannel(interaction.channelId))
        {
            await interaction.reply("There is currently no queue in this channel to join!");
            return;
        }      

        if (QueueService.playerIsInAQueue(interaction.user.id))
        {
            await interaction.reply("You are already in a queue!");
            return;
        }

        const queueId: GuidValue = QueueService.getQueueIdFromChannelId(interaction.channelId);

        if(!QueueService.queueIsJoinable(queueId))
        {
            await interaction.reply("The queue in this channel cannot be joined!");
            return;
        }

        QueueService.joinQueue(queueId, interaction.user.Id);
      
        const gamemode: string = QueueService.getQueueGameMode(queueId);
        const playersNeeded: number = QueueService.getPlayersNeeded(queueId);

        if(playersNeeded != 0)
        {
            // This will work unless the server has over 1000 members
            const serverMemberList = await interaction.guild.members.list()
            console.log("Server Member List");
            console.log(serverMemberList);

            const queueMemberIds = QueueService.getQueueMemberIds(queueId);
            console.log("Queue Member Ids");
            console.log(queueMemberIds);
            let members = serverMemberList.filter(user => queueMemberIds.includes(user.id));
            console.log("Members");
            console.log(members);

            let membersString = members.keys().join(", ");
            console.log("Members String");
            console.log(membersString);


            // TODO: Have this list the actual player names
            await interaction.reply(`${membersString} need ${playersNeeded} more players are needed in the ${gamemode} queue! Type \`/queue\` to join!`);
            return;
        }
        else
        {
            let startQueueInteraction = QueueService.getQueueInteraction(queueId);
            // TODO: What this needs to do is respond to the original message (using startQueueInteraction), and then start running through the map selection flow
            await interaction.reply("Congratulations, I hadn't thought this far yet");
        }
	},
};