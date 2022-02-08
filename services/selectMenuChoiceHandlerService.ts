import { SelectMapSelectionModeChoice } from "../selectmenucommands/selectMapSelectionModeChoice";

export abstract class SelectMenuChoiceHandlerService {
    public static HandleInteraction = async(interaction: any): Promise<void> => {
        switch(this.GetSelectChoiceArchetype(interaction.customId))
        {
            case 'selectmapselectionmode':
                await interaction.deferReply({ ephemeral: true});
                await SelectMapSelectionModeChoice.OnPress(interaction);
                break;
            default:
                await interaction.reply("This dropdown is not yet implemented");
                break;
        }
    }

    private static GetSelectChoiceArchetype(customId: string): string {
        return customId.split('_')[0];
    }
}