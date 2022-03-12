declare type Auth = {
    AccessToken: string;
    CampaignID: string;
};
export declare class Patreon {
    private static _URL;
    private static _AccessToken;
    private static _CampaignID;
    static Authorization(AuthInformation: Auth): void;
    private static FetchAPI;
    private static CleanQueryURL;
    static FetchPatrons(filter?: string[]): Promise<any[]>;
}
export {};
//# sourceMappingURL=index.d.ts.map