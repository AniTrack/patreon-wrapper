export type PatronStatus = 'active_patron' | 'declined_patron' | 'former_patron';
export type PatronAPIAuth = {
    AccessToken: string;
    CampaignID: string;
};
export type PatronType = {
    displayId: string;
    displayName: string;
    emailAddress: string;
    isFollower: boolean;
    subscription: {
        note: string;
        currentEntitled: {
            status: PatronStatus;
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
    private static CleanURL;
    static FetchPatrons(filters?: Array<PatronStatus>, pageSize?: number): Promise<PatronType[]>;
    protected static _SandboxAddPatron(Patron: SandboxOptions): void;
    protected static _SandboxGetPatron(): SandboxOptions[];
}
export declare class Sandbox extends Patreon {
    static GetSandboxPatrons(): SandboxOptions[];
    static AddSandboxPatron(Patron: SandboxOptions): void;
}
//# sourceMappingURL=index.d.ts.map