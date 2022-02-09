import { JoinQueueButtonPress } from "../buttoncommands/joinQueueButtonPress";
import { StringUtils } from "../utilities/stringUtils";

export abstract class ButtonPressHandlerService {
    public static HandleInteraction = async(interaction: any): Promise<void> => {
        switch(StringUtils.GetCustomIdChoiceArchetype(interaction.customId))
        {
            case 'joinqueue':
                await interaction.deferReply({ ephemeral: true});
                await JoinQueueButtonPress.OnPress(interaction);
                break;
            case 'leavequeue':
                break;
            case 'stopqueue':
                break;
            default:
                await interaction.reply("This button is not yet implemented");
                break;
        }
    }
}