"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sandbox = exports.Patreon = void 0;
const axios_1 = __importDefault(require("axios"));
class Patreon {
    static Authorization(AuthInformation) {
        if (!AuthInformation.AccessToken || !AuthInformation.CampaignID) {
            throw new Error('AccessToken and CampaignID are required on Authorization');
        }
        else if (typeof AuthInformation.AccessToken != 'string' ||
            typeof AuthInformation.CampaignID != 'string') {
            throw new Error('Invalid input, not a type of String');
        }
        this._AccessToken = AuthInformation.AccessToken;
        this._CampaignID = AuthInformation.CampaignID;
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
    static CleanQueryURL(query) {
        query = query.replaceAll('[', '%5B').replaceAll(']', '%5D');
        query = query.replaceAll(' ', '');
        return query;
    }
    static async FetchPatrons(filters = ['active_patron'], pageSize = 450) {
        const res = await this.FetchAPI(this.CleanQueryURL(`campaigns/${this._CampaignID}/` +
            `members ? include = user, currently_entitled_tiers & page[count] = ${pageSize} & fields[member] = campaign_lifetime_support_cents, currently_entitled_amount_cents, email, full_name, is_follower, last_charge_date, last_charge_status, lifetime_support_cents, next_charge_date, note, patron_status, pledge_cadence, pledge_relationship_start, will_pay_amount_cents & fields[user] = social_connections & fields[tier] = title`));
        var Patrons = [];
        if (!res?.data?.data)
            return [];
        if (res.data.data.length == 0)
            return [];
        // Processing Fake Sandbox Patrons
        this._SandboxPatrons.forEach((Patron) => Patrons.push({
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
        }));
        // Processing Real Patrons
        res.data.data.forEach((Patron) => {
            if (!filters.includes(Patron.attributes.patron_status))
                return;
            var socialInfo = res.data.included.find((includePatron) => includePatron.id == Patron.relationships.user.data.id &&
                includePatron.type === 'user');
            var tierInfo = res.data.included.find((includePatron) => includePatron.id ==
                Patron.relationships.currently_entitled_tiers?.data[0]
                    ?.id && includePatron.type === 'tier');
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
                        cents: Patron.attributes.currently_entitled_amount_cents !=
                            0
                            ? Patron.attributes
                                .currently_entitled_amount_cents
                            : null,
                        willPayCents: Patron.attributes.will_pay_amount_cents,
                        lifetimeCents: Patron.attributes.lifetime_support_cents,
                        firstCharge: Patron.attributes.pledge_relationship_start,
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
                        url: 'https://discordapp.com/users/' +
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
    static _SandboxAdd(Patron) {
        this._SandboxPatrons.push(Patron);
    }
    static _SandboxGet() {
        return this._SandboxPatrons;
    }
}
exports.Patreon = Patreon;
Patreon._URL = 'https://www.patreon.com/api/oauth2/v2/';
Patreon._SandboxPatrons = [];
class Sandbox extends Patreon {
    static GetFakePatrons() {
        return super._SandboxGet();
    }
    static AppendPatron(Patron) {
        super._SandboxAdd(Patron);
    }
}
exports.Sandbox = Sandbox;
//# sourceMappingURL=index.js.map