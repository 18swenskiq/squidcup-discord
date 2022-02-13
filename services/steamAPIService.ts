import fetch from 'node-fetch';
import { MapData } from '../types/mapData';
import { DateUtils } from '../utilities/dateUtils';

export abstract class SteamApiService {

    private static collectionMapsCacheList: CollectionMapsCache[] = [];

    public static async GetMapInfoInCollection(itemId: string, collectionId: string): Promise<MapData> {
        const maps = await this.GetMapsFromCollection(collectionId);
        return maps.find(m => m.GetPublishedFileId() == itemId);
    }

    public static async GetMapsFromCollection(collectionId: string): Promise<MapData[]>
    {
        let currentTime = Date.now();

        // Case: This collection is currently not cached at all
        if (this.collectionMapsCacheList.length == 0 || (!this.collectionMapsCacheList.find(c => c.AssociatedId === collectionId)))
        {
            console.log(`Building new collection cache for ${collectionId}...`);
            const collectionMaps = await this.GetCollectionDetails(collectionId);
            const mapObjects = await this.GetPublishedFileDetails(collectionMaps);
            const maps = this.CreateMapDataList(mapObjects);
            this.collectionMapsCacheList.push(new CollectionMapsCache(collectionId, maps, Date.now()));
            console.log(`Built new collection cache for ${collectionId}!`);
            return maps;
        }
        // Case: This collection is cached, however it is expired
        else if (DateUtils.GetMinutesBetweenDates(this.collectionMapsCacheList.find(c => c.AssociatedId === collectionId).TimeRetrieved, currentTime) > 60)
        {
            console.log(`Refreshing map cache for ${collectionId}...`);
            const collectionMaps = await this.GetCollectionDetails(collectionId);
            const mapObjects = await this.GetPublishedFileDetails(collectionMaps);
            const maps = this.CreateMapDataList(mapObjects);

            // Keep every cache alive, except for this one
            this.collectionMapsCacheList = this.collectionMapsCacheList.filter(cache => cache.AssociatedId != collectionId);

            this.collectionMapsCacheList.push(new CollectionMapsCache(collectionId, maps, Date.now()));
            console.log(`Refreshed collection cache for ${collectionId}!`);
            return maps;
        }
        // Case: The current cache is valid
        else
        {
            return this.collectionMapsCacheList.find(c => c.AssociatedId === collectionId).Maps;
        }
    } 

    private static async GetPublishedFileDetails(items: string[]) {
        let publishedFileIds = "";
        for (let i = 0; i < items.length; i++) {
            publishedFileIds += `&publishedfileids[${i}]=${items[i]}`;
        }

        const response = await fetch("https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/",
        {
            body: `itemcount=${items.length}${publishedFileIds}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "post"
        });
        const jsonObject = await response.json();
        return jsonObject["response"]["publishedfiledetails"];
    }

    private static async GetCollectionDetails(collectionId: string) : Promise<string[]>
    {
        const response = await fetch("https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/",
            {
                body: `collectioncount=1&publishedfileids[0]=${collectionId}`,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                method: "post"
            });
        const jsonObject = await response.json();
        return jsonObject["response"]["collectiondetails"][0]["children"].map(x => x["publishedfileid"]);
    }

    private static CreateMapDataList(mapObjects: any): MapData[]
    {
        let retList: MapData[] = [];
        mapObjects.forEach(element => {
            retList.push(new MapData(element["publishedfileid"], element["preview_url"], element["title"], element["description"]));
        });
        // Only return maps that we could get the info of
        return retList.filter(map => map.GetWorkshopTitle() != undefined);
    }
}

class CollectionMapsCache {
    public AssociatedId: string;
    public Maps: MapData[];
    public TimeRetrieved: number;

    constructor(associatedId: string, maps: MapData[], timeRetrieved: number)
    {
        this.AssociatedId = associatedId;
        this.Maps = maps;
        this.TimeRetrieved = timeRetrieved;
    }
}