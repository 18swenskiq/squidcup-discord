import { SelectMapSelectionModeChoice } from "../selectmenucommands/selectMapSelectionModeChoice";
import { StringUtils } from "../utilities/stringUtils";

export abstract class SelectMenuChoiceHandlerService {
    public static HandleInteraction = async(interaction: any): Promise<void> => {
        switch(StringUtils.GetCustomIdChoiceArchetype(interaction.customId))
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
}