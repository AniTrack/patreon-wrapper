declare type Auth = {
    AccessToken: string;
    CampaignID: string;
};
declare type PatronType = {
    displayId: string;
    displayName: string;
    emailAddress: string;
    isFollower: boolean;
    subscription: {
        note: string;
        currentEntitled: {
            status: string;
            tierId: number;
            cents: number;
            willPayCents: number;
            lifetimeCents: number;
            firstCharge: Date;
            nextCharge: Date;
            lastCharge: Date;
        };
    };
    mediaConnection: {
        patreon: {
            id: string;
            url: string;
        };
        discord: {
            id: string;
            url: string;
        };
    };
};
export declare class Patreon {
    private static _URL;
    private static _AccessToken;
    private static _CampaignID;
    static Authorization(AuthInformation: Auth): void;
    private static FetchAPI;
    private static CleanQueryURL;
    static FetchPatrons(filter?: string[]): Promise<PatronType[]>;
}
export {};
//# sourceMappingURL=index.d.ts.map