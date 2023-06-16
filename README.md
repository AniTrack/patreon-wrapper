# 🍊 Patreon Wrapper

💎 Universal Patron API v2 wrapper that simplifies their API usage in JavaScript

> This package was previously used on [AniTrack.co](https://anitrack.co) before switching to the payment gateway

# Table of Contents

-   [Install](#Install%20the%20package)
-   [Getting Started](#Getting%20Started)
-   [Sandbox for development](#Patreon%20Sandbox)
-   [License](#license)

<br />

# Install the package

```
$ npm install @anitrack/patreon-wrapper
```

<br />

# Getting Started

```js
import { Patreon } from '@anitrack/patreon-wrapper';
```

<br />

# API Authorization

> Where do I find Campaign ID? F12 your Patreon page and search for "campaign" then keep looking until you finds URL with campaign params that contains around 7 degits. That should be your Campaign ID

```js
Patreon.Authorization({
    AccessToken: 'YOUR_API_V2_ACCESS_TOKEN',
    CampaignID: 'YOUR_CAPAIGN_ID',
});
```

<br />

# Package Usage

## Fetching every Patrons from the Campaign

```js
const Patrons = await Patreon.FetchPatrons([
    'active_patron',
    'declined_patron',
    'former_patron',
]);

console.log(Patrons);
```

## Patron object example

console.log(Patrons) from above

```js
 [
    {
      displayId: '12345678',
      displayName: 'Username',
      emailAddress: 'email@address.com',
      isFollower: false,
      subscription: {
        note: '',
        currentEntitled: {
          status: 'active_patron',
          tier: {
            id: '12345678',
            title: 'My First Tier'
          },
          cents: 500,
          willPayCents: 500,
          lifetimeCents: 1500,
          firstCharge: '2022-01-15 15:00:00.000',
          nextCharge: '2022-05-15 15:00:00.000',
          lastCharge: '2022-05-15 15:00:00.000'
        }
      },
      mediaConnection: {
        patreon: {
          id: '12345678',
          url: 'https://www.patreon.com/api/oauth2/v2/user/12345678'
        },
        discord: {
          id: '12345678',
          url: 'https://discordapp.com/users/12345678'
        }
      }
    },
    ...
]
```

<br />

# Patreon Sandbox

> This is great for development and working with sandbox patrons users. The sandbox patrons object will be exactly the same as real ones!

## Adding Custom Patrons to the Sandbox

You can add as much sandbox patrons as you want

```js
import { Sandbox } from '@anitrack/patreon-wrapper';

Sandbox.AddPatron({
    displayId: '123', // Patreon ID
    displayName: '123', // Patreon Username
    emailAddress: 'email@address.com', // Patreon Email
    tier: { id: '123', title: 'Tier 1' }, // Current Tier
    cents: 500, // Current paying in cent 500 -> $5.00
    willPayCents: 500, // Next pay price
    lifetimeCents: 1500, // Total lifetime spent
    firstCharge: '2022-01-15 15:00:00.000', // ISO 8601 String date format
    nextCharge: '2022-05-15 15:00:00.000',
    lastCharge: '2022-04-15 15:00:00.000',
    patronStatus: 'active_patron',
    mediaConnection: {
        patreon: {
            id: '123',
            url: 'https://www.patreon.com/api/oauth2/v2/user/user_id',
        },
        discord: { id: '123', url: 'https://discord.com/users/user_id' },
    },
});

const Patrons = Sandbox.GetPatrons();

console.log(Patrons);
```

## Get both Sandbox Patrons and Real Patrons

set second boolean argument "showSandboxPatrons" to true

```js
const Patrons = await Patreon.FetchPatrons(
    ['active_patron', 'declined_patron', 'former_patron'],
    true
);

console.log(Patrons);
```

<br />

# License

[MIT](LICENSE)
