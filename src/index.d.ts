export type PatronStatus = 'active_patron' | 'declined_patron' | 'former_patron';
export type PatronAPIAuth = {
    AccessToken: string;
    CampaignID: string;
};
export type PatronType = {
    displayId: string;
    displayName: string | null;
    emailAddress: string | null;
    isFollower: boolean;
    subscription: {
        note: string;
        currentEntitled: {
            status: PatronStatus;
            lastChargeStatus: string | null;
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
            id: string | null;
            url: string | null;
        };
    };
};
export type CampaignType = {
    id: string;
    name: string;
    patronCount: number;
    currency: string;
    isMonthly: boolean;
    isNsfw: boolean;
    summary: string | null;
    createdAt: string;
    publishedAt: string | null;
    imageUrl: string | null;
    imageSmallUrl: string | null;
    discordServerId: string | null;
};
export type SandboxOptions = {
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
    patronStatus: PatronStatus;
    firstCharge: string;
    nextCharge: string;
    lastCharge: string;
    mediaConnection: {
        patreon: {
            id: string;
            url: string;
        };
        discord: {
            id: string | null;
            url: string | null;
        };
    };
};
export declare class Patreon {
    private static _URL;
    private static _AccessToken;
    private static _CampaignID;
    private static _SandboxPatrons;
    static Authorization(AuthCredentials: PatronAPIAuth): void;
    private static FetchAPI;
    private static BuildMembersURL;
    static FetchPatrons(filters?: Array<PatronStatus>, pageSize?: number, showSandboxPatrons?: boolean): Promise<PatronType[]>;
    protected static _SandboxAddPatron(Patron: SandboxOptions): void;
    protected static _SandboxGetPatron(): SandboxOptions[];
    static FetchCampaign(): Promise<CampaignType>;
}
export declare class Sandbox extends Patreon {
    static GetPatrons(): SandboxOptions[];
    static AddPatron(Patron: SandboxOptions): void;
}
//# sourceMappingURL=index.d.ts.map