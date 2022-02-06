const { MessageActionRow, MessageSelectMenu } = require('discord.js');

export class MapSelection {

    private Interaction: any;

    constructor(interaction: any)
    {
        this.Interaction = interaction;
    }

    public createMapSelectionChoiceDropdown = async(): Promise<void> => 
    {
        const row = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('select')
					.setPlaceholder('Nothing selected')
					.addOptions([
						{
							label: 'Season Pool Veto',
							description: 'Veto from the pool of the current season for extra squidcoins!',
							value: 'season_pool',
						},
						{
							label: 'All Pick/Random Selection',
							description: 'Everyone picks a map, and a random one is selected',
							value: 'all_pick',
						},
					]),
			);
        
        await this.Interaction.followUp({ content: '<Insert Queue Leader Name here>, please pick a map selection mode!', components: [row]});
    }
}