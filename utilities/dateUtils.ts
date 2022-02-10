export abstract class DateUtils
{
    public static GetMinutesBetweenDates(firstTime: number, lastTime: number): number {
        console.log(`Minutes: ${(lastTime - firstTime) / 60000}`);
        return ((lastTime - firstTime) / 60000);
    } 
}