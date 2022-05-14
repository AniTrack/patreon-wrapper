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
            status: 'active_patron' | 'declined_patron';
            tier: {
                id: string;
                title: string;
            };
            cents: number;
            willPayCents: number;
            lifetimeCents: number;
            firstCharge: string;
            nextCharge: string;
            lastCharge: string;
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
declare type SandboxOptions = {
    displayId: string;
    displayName: string;
    emailAddress: string;
    tier: {
        id: string;
        title: string;
    };
    cents: number;
    willPayCents: number;
    lifetimeCents: number;
    patronStatus: 'active_patron' | 'declined_patron';
    firstCharge: string;
    nextCharge: string;
    lastCharge: string;
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
    private static _SandboxPatrons;
    static Authorization(AuthInformation: Auth): void;
    private static FetchAPI;
    private static CleanQueryURL;
    static FetchPatrons(filters?: Array<'active_patron' | 'declined_patron'>, pageSize?: number): Promise<PatronType[]>;
    protected static _SandboxAdd(Patron: SandboxOptions): void;
    protected static _SandboxGet(): SandboxOptions[];
}
export declare class Sandbox extends Patreon {
    static GetFakePatrons(): SandboxOptions[];
    static AppendPatron(Patron: SandboxOptions): void;
}
export {};
//# sourceMappingURL=index.d.ts.map