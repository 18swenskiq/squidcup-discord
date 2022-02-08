import { ButtonPressHandlerService } from "../services/buttonPressHandlerService";
import { SelectMenuChoiceHandlerService } from "../services/selectMenuChoiceHandlerService";

module.exports = {
	name: 'interactionCreate',
	execute: async(interaction) => {
		// If the interaction is a button press, let's see if its something we care about
		if (interaction.isButton())
		{
			await ButtonPressHandlerService.HandleInteraction(interaction);
			return;
		}

		// If the interaction is a select menu, we should also see if we care about that
		if (interaction.isSelectMenu())
		{
			await SelectMenuChoiceHandlerService.HandleInteraction(interaction);
			return;
		}

		// At this point, if the interaction isn't a command, we do not care
		if (!interaction.isCommand()) return;
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			try {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			catch
			{
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			
	}
	},
};