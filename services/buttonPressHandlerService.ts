import { JoinQueueButtonPress } from "../buttoncommands/joinQueueButtonPress";

export abstract class ButtonPressHandlerService {
    public static HandleInteraction = async(interaction: any): Promise<void> => {
        switch(this.GetButtonPressArchetype(interaction.customId))
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

    private static GetButtonPressArchetype(customId: string): string {
        return customId.split('_')[0];
    }
}