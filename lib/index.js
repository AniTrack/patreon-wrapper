"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Patreon = void 0;
const axios_1 = __importDefault(require("axios"));
class Patreon {
    static Authorization(AuthInformation) {
        if (!AuthInformation.AccessToken || !AuthInformation.CampaignID) {
            throw new Error('Either Missing AccessToken or CampaignID');
        }
        else if (typeof AuthInformation.AccessToken != 'string' ||
            typeof AuthInformation.CampaignID != 'string') {
            throw new Error('Invalid input, not a type of String');
        }
        this._AccessToken = AuthInformation.AccessToken;
        this._CampaignID = AuthInformation.CampaignID;
    }
    static async FetchAPI(URI) {
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
    static async FetchPatrons(filter = []) {
        const res = await this.FetchAPI(this.CleanQueryURL(`campaigns/${this._CampaignID}/` +
            `members ? include = user, currently_entitled_tiers & fields[member] = campaign_lifetime_support_cents, currently_entitled_amount_cents, email, full_name, is_follower, last_charge_date, last_charge_status, lifetime_support_cents, next_charge_date, note, patron_status, pledge_cadence, pledge_relationship_start, will_pay_amount_cents & fields[user] = social_connections`));
        const Patrons = [];
        res.data.data.forEach((Patron) => {
            var include = res.data.included.find((includePatron) => includePatron.id == Patron.relationships.user.data.id);
            Patrons.push({
                displayId: Patron.relationships.user.data.id,
                displayName: Patron.attributes.full_name,
                emailAddress: Patron.attributes.email,
                isFollower: Patron.attributes.is_follower,
                subscription: {
                    note: Patron.attributes.note,
                    currentEntitled: {
                        status: Patron.attributes.patron_status,
                        tierId: Patron.relationships.currently_entitled_tiers
                            ?.data[0]?.id,
                        cents: Patron.attributes
                            .currently_entitled_amount_cents,
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
                        id: include.attributes.social_connections.discord
                            .user_id,
                        url: 'https://discordapp.com/users/' +
                            include.attributes.social_connections.discord
                                .user_id,
                    },
                },
            });
        });
        return Patrons;
    }
}
exports.Patreon = Patreon;
Patreon._URL = 'https://www.patreon.com/api/oauth2/v2/';
//# sourceMappingURL=index.js.map