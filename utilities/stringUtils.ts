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
}