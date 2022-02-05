export {};
const { SlashCommandBuilder } = require('@discordjs/builders');
import path from 'path';

process.chdir(__dirname);
import { Queue } from "../playqueue/queue";
import { Guid } from "../types/guid";
import { QueueService } from "../services/queueService";

const configPath = path.resolve(__dirname, "../cfg/config.json");
const { role2v2, role3v3 } = require(configPath);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startqueue')
		.setDescription('Start a SquidCup queue')
        .addStringOption(option => 
            option.setName('gamesize')
                .setDescription('The size of the game')
                .setRequired(true)
                .addChoice('2v2', '2v2')
                .addChoice('3v3', '3v3')),
	async execute(interaction) {
        const gameSize = interaction.options.getString('gamesize');

        // If we can't create a queue, let's yeet out of here
        if (!QueueService.canCreateQueue(interaction.user.id))
        {
            await interaction.reply(`You are not allowed to create a queue at this time`);
            return;
        }

        // Set up some strings for replying
        let mentionString: string;
        let playersNeeded: string;
        switch(gameSize) {
            case "2v2":
                mentionString = `<@&${role2v2}>`;
                playersNeeded = '3';
                break;
            case "3v3":
                mentionString = `<@&${role3v3}>`;
                playersNeeded = '5';
                break;
            default:
                mentionString = "Hey everyone!";
                playersNeeded = "";
                break;    
        }

        // Create a new queue with a guid so we can find it later (and pass it the interaction)
        const queueId = Guid.newGuid();
        new Queue(interaction, queueId, gameSize);

        await interaction.reply(`${mentionString}, ${interaction.member.displayName} is looking for ${playersNeeded} more players for a ${gameSize} match! Type \`/queue\` to join!`);        
	},
};