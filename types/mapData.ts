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

    public GetPublishedFileId(): string {
        return this.PublishedFileId;
    }

    public GetWorkshopThumbnailUrl(): string {
        return this.WorkshopThumbnailUrl;
    }

    public GetWorkshopTitle(): string {
        return this.WorkshopTitle;
    }

    public GetDescription(): string {
        return this.Description;
    }
}