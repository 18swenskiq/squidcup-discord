export {};
const { SlashCommandBuilder } = require('@discordjs/builders');
import path from 'path';

process.chdir(__dirname);
import { Queue } from "../playqueue/queue";
import { Guid } from "../types/guid";
import { QueueService } from "../services/queueService";
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { QueueMode } from '../types/queueMode';

const configPath = path.resolve(__dirname, "../cfg/config.json");
const { role1v1, role2v2, role3v3 } = require(configPath);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('startqueue')
		.setDescription('Start a SquidCup queue')
        .addStringOption(option => 
            option.setName('gamesize')
                .setDescription('The size of the game')
                .setRequired(true)
                .addChoice(QueueMode.Aim, QueueMode.Aim)
                .addChoice(QueueMode.Wingman, QueueMode.Wingman)
                .addChoice(QueueMode.Thirdwheel, QueueMode.Thirdwheel)),
	async execute(interaction) {
        await interaction.deferReply();
        const gameSize = interaction.options.getString('gamesize');

        // If we can't create a queue, let's yeet out of here
        if (!QueueService.canCreateQueue(interaction.user.id))
        {
            await interaction.editReply(`You are not allowed to create a queue at this time`);
            return;
        }

        // Set up some strings for replying
        let mentionString: string;
        let playersNeeded: string;
        switch(gameSize) {
            case QueueMode.Aim:
                mentionString = `<@&${role1v1}>`;
                playersNeeded = '1';
                break;
            case QueueMode.Wingman:
                mentionString = `<@&${role2v2}>`;
                playersNeeded = '3';
                break;
            case QueueMode.Thirdwheel:
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

        const buttons = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`joinqueue_${queueId}`)
                    .setLabel('Join Queue')
                    .setStyle('SUCCESS'),
                new MessageButton()
                    .setCustomId(`leavequeue_${queueId}`)
                    .setLabel('Leave Queue')
                    .setStyle("DANGER"),
                new MessageButton()
                    .setCustomId(`stopqueue_${queueId}`)
                    .setLabel("Stop Queue")
                    .setStyle("DANGER"),
            );

        const initialEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${gameSize} Queue`)
            .addFields(
                {name: 'Players Needed', value: playersNeeded, inline: true},
                {name: 'Players in Queue', value: interaction.member.displayName, inline: true},
            )
            .setTimestamp();

        await interaction.editReply({content: `${gameSize} Queue Started!`, components: [buttons], embeds: [initialEmbed]});
        await interaction.followUp(`${mentionString}, ${interaction.member.displayName} is looking for ${playersNeeded} more ${parseInt(playersNeeded) > 1 ? 'players' : 'player'} for a ${gameSize} match!`);        
	},
};