export abstract class DateUtils
{
    public static GetMinutesBetweenDates(firstTime: number, lastTime: number): number {
        return ((lastTime - firstTime) / 60000);
    } 
}