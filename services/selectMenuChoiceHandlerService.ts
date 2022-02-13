import { SelectMenuInteraction } from "discord.js";
import { SelectMapSelectionModeChoice } from "../selectmenucommands/selectMapSelectionModeChoice";
import { SpecifyMapVoteChoice } from "../selectmenucommands/specifyMapVoteChoice";
import { StringUtils } from "../utilities/stringUtils";

export abstract class SelectMenuChoiceHandlerService {
    public static HandleInteraction = async(interaction: SelectMenuInteraction): Promise<void> => {
        switch(StringUtils.GetCustomIdChoiceArchetype(interaction.customId))
        {
            case 'selectmapselectionmode':
                await interaction.deferReply({ ephemeral: true});
                await SelectMapSelectionModeChoice.OnPress(interaction);
                break;
            case 'specifymapvote':
                await interaction.deferReply({ ephemeral: true});
                await SpecifyMapVoteChoice.OnPress(interaction);
                break;
            default:
                await interaction.reply("This dropdown is not yet implemented");
                break;
        }
    }
}