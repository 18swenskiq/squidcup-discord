import { GuidValue } from "../types/guid";

export abstract class StringUtils {
    public static MemberNameListToString(memberNames: string[]) : string
    {
        if(memberNames.length == 0)
        {
            return "";
        }

        var last = memberNames.pop();
        return memberNames.join(', ') + ' and ' + last;
    }

    public static GetCustomIdChoiceArchetype(customId: string): string {
        return customId.split('_')[0];
    }

    public static GetQueueIdFromCustomId(customId: string): GuidValue {
        return customId.split("_")[1];
    }
}