import axios from 'axios';

export type PatronStatus =
    | 'active_patron'
    | 'declined_patron'
    | 'former_patron';

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

export class Patreon {
    private static _URL: string = 'https://www.patreon.com/api/oauth2/v2/';

    private static _AccessToken: string;
    private static _CampaignID: string;
    private static _SandboxPatrons: Array<SandboxOptions> = [];

    public static Authorization(AuthCredentials: PatronAPIAuth) {
        if (!AuthCredentials.AccessToken || !AuthCredentials.CampaignID) {
            throw new Error(
                'AccessToken and CampaignID are required on Authorization'
            );
        }

        this._AccessToken = AuthCredentials.AccessToken;
        this._CampaignID = AuthCredentials.CampaignID;
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

    private static CleanURL(query: string) {
        query = query.replaceAll('[', '%5B').replaceAll(']', '%5D');
        query = query.replaceAll(' ', '');

        return query;
    }

    public static async FetchPatrons(
        filters: Array<PatronStatus> = ['active_patron'],
        pageSize: number = 450,
        showSandboxPatrons: boolean = false
    ) {
        const { data } = await this.FetchAPI(
            this.CleanURL(
                `campaigns/${this._CampaignID}/` +
                    `members ? include = user, currently_entitled_tiers & page[count] = ${pageSize} & fields[member] = campaign_lifetime_support_cents, currently_entitled_amount_cents, email, full_name, is_follower, last_charge_date, last_charge_status, lifetime_support_cents, next_charge_date, note, patron_status, pledge_cadence, pledge_relationship_start, will_pay_amount_cents & fields[user] = social_connections & fields[tier] = title`
            )
        );

        const Patrons: Array<PatronType> = [];
        const PatreonAPIPatrons = data?.data || [];

        if (PatreonAPIPatrons.length == 0) return [];

        // Format Real Patrons
        for (let x = 0; x < PatreonAPIPatrons.length; x++) {
            const Relationships = PatreonAPIPatrons[x].relationships;
            const Attributes = PatreonAPIPatrons[x].attributes;

            if (!filters.includes(Attributes.patron_status)) continue;

            const socialInfo = data.included.find(
                (patron: any) =>
                    patron.id == Relationships.user.data.id &&
                    patron.type === 'user'
            );

            const tierInfo = data.included.find(
                (patron: any) =>
                    patron.id ==
                        Relationships.currently_entitled_tiers?.data[0]?.id &&
                    patron.type === 'tier'
            );

            Patrons.push({
                displayId: Relationships.user.data.id,
                displayName: Attributes.full_name,
                emailAddress: Attributes.email,
                isFollower: Attributes.is_follower,
                subscription: {
                    note: Attributes.note,
                    currentEntitled: {
                        status: Attributes.patron_status,
                        tier: {
                            id: tierInfo ? tierInfo.id : null,
                            title: tierInfo ? tierInfo.Attributes.title : null,
                        },
                        cents:
                            Attributes.currently_entitled_amount_cents != 0
                                ? Attributes.currently_entitled_amount_cents
                                : null,
                        willPayCents: Attributes.will_pay_amount_cents,
                        lifetimeCents: Attributes.lifetime_support_cents,
                        firstCharge: Attributes.pledge_relationship_start,
                        nextCharge: Attributes.next_charge_date,
                        lastCharge: Attributes.last_charge_date,
                    },
                },
                mediaConnection: {
                    patreon: {
                        id: Relationships.user.data.id,
                        url: Relationships.user.links.related,
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
        }

        if (showSandboxPatrons) {
            // Format Sandbox Patrons
            for (let x = 0; x < this._SandboxPatrons.length; x++) {
                const Patron = this._SandboxPatrons[x];

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
                });
            }
        }

        return Patrons;
    }

    protected static _SandboxAddPatron(Patron: SandboxOptions) {
        this._SandboxPatrons.push(Patron);
    }

    protected static _SandboxGetPatron() {
        return this._SandboxPatrons;
    }

    // public static FetchPatron() {}

    // public static FetchCampaign() {}
}

export class Sandbox extends Patreon {
    public static GetPatrons() {
        return super._SandboxGetPatron();
    }

    public static AddPatron(Patron: SandboxOptions) {
        super._SandboxAddPatron(Patron);
    }
}
