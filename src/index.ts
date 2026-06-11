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
    displayName: string | null; // [2026-05-26] Identity Masking
    emailAddress: string | null; // [2026-05-26] Identity Masking
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

    private static async FetchAPI(url: string) {
        if (!this._AccessToken || !this._CampaignID) {
            throw new Error(
                'AccessToken and CampaignID are required on Authorization'
            );
        }

        const resolvedUrl = url.startsWith('http') ? url : this._URL + url;

        return await axios(resolvedUrl, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + this._AccessToken },
        }).catch((err: Error) => {
            throw new Error('Fetch API Failed...' + err);
        });
    }

    private static BuildMembersURL(pageSize: number): string {
        const params = new URLSearchParams({
            include: 'user,currently_entitled_tiers',
            'page[count]': String(pageSize),
            'fields[member]':
                'currently_entitled_amount_cents,campaign_lifetime_support_cents,email,full_name,is_follower,last_charge_date,last_charge_status,next_charge_date,note,patron_status,pledge_relationship_start,will_pay_amount_cents',
            'fields[user]': 'social_connections',
            'fields[tier]': 'title',
        });

        return `${this._URL}campaigns/${this._CampaignID}/members?${params.toString()}`;
    }

    public static async FetchPatrons(
        filters: Array<PatronStatus> = ['active_patron'],
        pageSize: number = 450,
        showSandboxPatrons: boolean = false
    ) {
        const Patrons: Array<PatronType> = [];
        let nextUrl: string | null = this.BuildMembersURL(pageSize);

        while (nextUrl) {
            const { data } = await this.FetchAPI(nextUrl);
            const PagePatrons = data?.data || [];

            for (let x = 0; x < PagePatrons.length; x++) {
                const Relationships = PagePatrons[x].relationships;
                const Attributes = PagePatrons[x].attributes;

                if (!filters.includes(Attributes.patron_status)) continue;

                const socialInfo = data.included?.find(
                    (item: any) =>
                        item.id === Relationships.user.data.id &&
                        item.type === 'user'
                );

                const tierInfo = data.included?.find(
                    (item: any) =>
                        item.id ===
                            Relationships.currently_entitled_tiers?.data[0]
                                ?.id && item.type === 'tier'
                );

                const discordId =
                    socialInfo?.attributes?.social_connections?.discord
                        ?.user_id ?? null;

                Patrons.push({
                    displayId: Relationships.user.data.id,
                    displayName: Attributes.full_name ?? null,
                    emailAddress: Attributes.email ?? null,
                    isFollower: Attributes.is_follower,
                    subscription: {
                        note: Attributes.note,
                        currentEntitled: {
                            status: Attributes.patron_status,
                            lastChargeStatus:
                                Attributes.last_charge_status ?? null,
                            tier: {
                                id: tierInfo ? tierInfo.id : null,
                                title: tierInfo
                                    ? tierInfo.attributes.title
                                    : null,
                            },
                            cents:
                                Attributes.currently_entitled_amount_cents !== 0
                                    ? Attributes.currently_entitled_amount_cents
                                    : null,
                            willPayCents: Attributes.will_pay_amount_cents,
                            lifetimeCents:
                                Attributes.campaign_lifetime_support_cents,
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
                            id: discordId,
                            url: discordId
                                ? `https://discord.com/users/${discordId}`
                                : null,
                        },
                    },
                });
            }

            nextUrl = data?.links?.next ?? null;
        }

        if (showSandboxPatrons) {
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
                            lastChargeStatus: null,
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
                            id: Patron.mediaConnection.discord?.id ?? null,
                            url: Patron.mediaConnection.discord?.url ?? null,
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

    public static async FetchCampaign(): Promise<CampaignType> {
        const params = new URLSearchParams({
            'fields[campaign]':
                'name,currency,patron_count,is_monthly,is_nsfw,summary,created_at,published_at,image_url,image_small_url,discord_server_id',
        });

        const { data } = await this.FetchAPI(
            `campaigns/${this._CampaignID}?${params.toString()}`
        );

        const Attributes = data?.data?.attributes;

        return {
            id: data?.data?.id,
            name: Attributes.name,
            patronCount: Attributes.patron_count,
            currency: Attributes.currency,
            isMonthly: Attributes.is_monthly,
            isNsfw: Attributes.is_nsfw,
            summary: Attributes.summary ?? null,
            createdAt: Attributes.created_at,
            publishedAt: Attributes.published_at ?? null,
            imageUrl: Attributes.image_url ?? null,
            imageSmallUrl: Attributes.image_small_url ?? null,
            discordServerId: Attributes.discord_server_id ?? null,
        };
    }
}

export class Sandbox extends Patreon {
    public static GetPatrons() {
        return super._SandboxGetPatron();
    }

    public static AddPatron(Patron: SandboxOptions) {
        super._SandboxAddPatron(Patron);
    }
}
