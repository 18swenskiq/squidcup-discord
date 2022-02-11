export class MapData {
    private PublishedFileId: string;
    private WorkshopThumbnailUrl: string;
    private WorkshopTitle: string;
    private Description: string;

    constructor(publishedFileId: string, workshopThumbnailUrl: string, workshopTitle: string, description: string)
    {
        this.PublishedFileId = publishedFileId;
        this.WorkshopThumbnailUrl = workshopThumbnailUrl;
        this.WorkshopTitle = workshopTitle;
        this.Description = description;
    }

    public static GetMatchingMapNames(availableMaps: MapData[], userInput: string): MapData[]
    {
        return availableMaps.filter(map => map.GetWorkshopTitleLower().includes(userInput.toLowerCase()));
    }

    public GetPublishedFileId(): string {
        return this.PublishedFileId;
    }

    public GetWorkshopThumbnailUrl(): string {
        return this.WorkshopThumbnailUrl;
    }

    public GetWorkshopTitle(): string {
        return this.WorkshopTitle;
    }

    public GetWorkshopTitleLower(): string {
        return this.WorkshopTitle.toLowerCase();
    }

    public GetDescription(): string {
        return this.Description;
    }
}