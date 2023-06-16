import axios from 'axios';

export type PatronStatus =
    | 'active_patron'
    | 'declined_patron'
    | 'former_patron';

type Auth = {
    AccessToken: string;
    CampaignID: string;
};

type PatronType = {
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

type SandboxOptions = {
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

export class Patreon {
    private static _URL: string = 'https://www.patreon.com/api/oauth2/v2/';

    private static _AccessToken: string;
    private static _CampaignID: string;

    private static _SandboxPatrons: Array<SandboxOptions> = [];

    public static Authorization(AuthInformation: Auth) {
        if (!AuthInformation.AccessToken || !AuthInformation.CampaignID) {
            throw new Error(
                'AccessToken and CampaignID are required on Authorization'
            );
        } else if (
            typeof AuthInformation.AccessToken != 'string' ||
            typeof AuthInformation.CampaignID != 'string'
        ) {
            throw new Error('Invalid input, not a type of String');
        }

        this._AccessToken = AuthInformation.AccessToken;
        this._CampaignID = AuthInformation.CampaignID;
    }

    private static async FetchAPI(URI: string) {
        if (!this._AccessToken || !this._CampaignID) {
            throw new Error(
                'AccessToken and CampaignID are required on Authorization'
            );
        }

        return await axios(this._URL + URI, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + this._AccessToken },
        }).catch((err: Error) => {
            throw new Error('Fetch API Failed...' + err);
        });
    }

    private static CleanQueryURL(query: string) {
        query = query.replaceAll('[', '%5B').replaceAll(']', '%5D');
        query = query.replaceAll(' ', '');

        return query;
    }

    public static async FetchPatrons(
        filters: Array<PatronStatus> = ['active_patron'],
        pageSize: number = 450
    ) {
        const res: any = await this.FetchAPI(
            this.CleanQueryURL(
                `campaigns/${this._CampaignID}/` +
                    `members ? include = user, currently_entitled_tiers & page[count] = ${pageSize} & fields[member] = campaign_lifetime_support_cents, currently_entitled_amount_cents, email, full_name, is_follower, last_charge_date, last_charge_status, lifetime_support_cents, next_charge_date, note, patron_status, pledge_cadence, pledge_relationship_start, will_pay_amount_cents & fields[user] = social_connections & fields[tier] = title`
            )
        );

        var Patrons: Array<PatronType> = [];

        if (!res?.data?.data) return [];
        if (res.data.data.length == 0) return [];

        // Processing Fake Sandbox Patrons
        this._SandboxPatrons.forEach((Patron: SandboxOptions) =>
            Patrons.push({
                displayId: Patron.displayId,
                displayName: Patron.displayName,
                emailAddress: Patron.emailAddress,
                isFollower: false,
                subscription: {
                    note: 'Sandbox',
                    currentEntitled: {
                        status: Patron.patronStatus,
                        tier: {
                            id: Patron.tier.id,
                            title: Patron.tier.title,
                        },
                        cents: Patron.cents,
                        willPayCents: Patron.willPayCents,
                        lifetimeCents: Patron.lifetimeCents,
                        firstCharge: Patron.firstCharge,
                        nextCharge: Patron.nextCharge,
                        lastCharge: Patron.lastCharge,
                    },
                },
                mediaConnection: {
                    patreon: {
                        id: Patron.mediaConnection.patreon.id,
                        url: Patron.mediaConnection.patreon.url,
                    },
                    discord: {
                        id: Patron?.mediaConnection?.discord?.id
                            ? Patron?.mediaConnection?.discord?.id
                            : null,
                        url: Patron?.mediaConnection?.discord?.url
                            ? Patron?.mediaConnection?.discord?.id
                            : null,
                    },
                },
            })
        );

        // Processing Real Patrons
        res.data.data.forEach((Patron: any) => {
            if (!filters.includes(Patron.attributes.patron_status)) return;

            var socialInfo = res.data.included.find(
                (includePatron: any) =>
                    includePatron.id == Patron.relationships.user.data.id &&
                    includePatron.type === 'user'
            );

            var tierInfo = res.data.included.find(
                (includePatron: any) =>
                    includePatron.id ==
                        Patron.relationships.currently_entitled_tiers?.data[0]
                            ?.id && includePatron.type === 'tier'
            );

            Patrons.push({
                displayId: Patron.relationships.user.data.id,
                displayName: Patron.attributes.full_name,
                emailAddress: Patron.attributes.email,
                isFollower: Patron.attributes.is_follower,
                subscription: {
                    note: Patron.attributes.note,
                    currentEntitled: {
                        status: Patron.attributes.patron_status,
                        tier: {
                            id: tierInfo ? tierInfo.id : null,
                            title: tierInfo ? tierInfo.attributes.title : null,
                        },
                        cents:
                            Patron.attributes.currently_entitled_amount_cents !=
                            0
                                ? Patron.attributes
                                      .currently_entitled_amount_cents
                                : null,
                        willPayCents: Patron.attributes.will_pay_amount_cents,
                        lifetimeCents: Patron.attributes.lifetime_support_cents,
                        firstCharge:
                            Patron.attributes.pledge_relationship_start,
                        nextCharge: Patron.attributes.next_charge_date,
                        lastCharge: Patron.attributes.last_charge_date,
                    },
                },
                mediaConnection: {
                    patreon: {
                        id: Patron.relationships.user.data.id,
                        url: Patron.relationships.user.links.related,
                    },
                    discord: {
                        id: socialInfo?.attributes?.social_connections?.discord
                            ?.user_id
                            ? socialInfo?.attributes?.social_connections
                                  ?.discord?.user_id
                            : null,
                        url:
                            'https://discordapp.com/users/' +
                            socialInfo?.attributes?.social_connections?.discord
                                ?.user_id
                                ? socialInfo?.attributes?.social_connections
                                      ?.discord?.user_id
                                : null,
                    },
                },
            });
        });
        return Patrons;
    }

    protected static _SandboxAdd(Patron: SandboxOptions) {
        this._SandboxPatrons.push(Patron);
    }

    protected static _SandboxGet() {
        return this._SandboxPatrons;
    }

    // public static FetchPatron() {}

    // public static FetchCampaign() {}
}

export class Sandbox extends Patreon {
    public static GetFakePatrons() {
        return super._SandboxGet();
    }

    public static AppendPatron(Patron: SandboxOptions) {
        super._SandboxAdd(Patron);
    }
}
