"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = exports.Patreon = void 0;
const axios_1 = __importDefault(require("axios"));
class Patreon {
    static Authorization(AuthCredentials) {
        if (!AuthCredentials.AccessToken || !AuthCredentials.CampaignID) {
            throw new Error('AccessToken and CampaignID are required on Authorization');
        }
        this._AccessToken = AuthCredentials.AccessToken;
        this._CampaignID = AuthCredentials.CampaignID;
    }
    static async FetchAPI(URI) {
        if (!this._AccessToken || !this._CampaignID) {
            throw new Error('AccessToken and CampaignID are required on Authorization');
        }
        return await (0, axios_1.default)(this._URL + URI, {
            method: 'GET',
            headers: { Authorization: 'Bearer ' + this._AccessToken },
        }).catch((err) => {
            throw new Error('Fetch API Failed...' + err);
        });
    }
    static CleanURL(query) {
        query = query.replaceAll('[', '%5B').replaceAll(']', '%5D');
        query = query.replaceAll(' ', '');
        return query;
    }
    static async FetchPatrons(filters = ['active_patron'], pageSize = 450, showSandboxPatrons = false) {
        const { data } = await this.FetchAPI(this.CleanURL(`campaigns/${this._CampaignID}/` +
            `members ? include = user, currently_entitled_tiers & page[count] = ${pageSize} & fields[member] = campaign_lifetime_support_cents, currently_entitled_amount_cents, email, full_name, is_follower, last_charge_date, last_charge_status, lifetime_support_cents, next_charge_date, note, patron_status, pledge_cadence, pledge_relationship_start, will_pay_amount_cents & fields[user] = social_connections & fields[tier] = title`));
        const Patrons = [];
        const PatreonAPIPatrons = data?.data || [];
        if (PatreonAPIPatrons.length == 0)
            return [];
        // Format Real Patrons
        for (let x = 0; x < PatreonAPIPatrons.length; x++) {
            const Relationships = PatreonAPIPatrons[x].relationships;
            const Attributes = PatreonAPIPatrons[x].attributes;
            if (!filters.includes(Attributes.patron_status))
                continue;
            const socialInfo = data.included.find((patron) => patron.id == Relationships.user.data.id &&
                patron.type === 'user');
            const tierInfo = data.included.find((patron) => patron.id ==
                Relationships.currently_entitled_tiers?.data[0]?.id &&
                patron.type === 'tier');
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
                        cents: Attributes.currently_entitled_amount_cents != 0
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
                        url: 'https://discordapp.com/users/' +
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
    static _SandboxAddPatron(Patron) {
        this._SandboxPatrons.push(Patron);
    }
    static _SandboxGetPatron() {
        return this._SandboxPatrons;
    }
}
exports.Patreon = Patreon;
Patreon._URL = 'https://www.patreon.com/api/oauth2/v2/';
Patreon._SandboxPatrons = [];
class Sandbox extends Patreon {
    static GetPatrons() {
        return super._SandboxGetPatron();
    }
    static AddPatron(Patron) {
        super._SandboxAddPatron(Patron);
    }
}
exports.Sandbox = Sandbox;
//# sourceMappingURL=index.js.map