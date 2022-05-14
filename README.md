# Patreon Wrapper 🍊

💎 Simple Patreon wrapper designed for Discord Bots to process user's premium subscription and lower down the Patreon API complexity...

🌄 You can also simulates sandbox of fake Patrons for development and code testing purposes

🍊 This package was also used in [AniTrack](https://anitrack.co) Discord Bot

## Table of Contents

-   [Installing](#installing)
-   [Real usage example](#Usage%20Example)
-   [Sandbox for development](#Sandboxing)
-   [License](#license)

<br />

## Installing

Using NPM

```
$ npm install @anitrack/patreon-wrapper
```

Using YARN

```
$ yarn add @anitrack/patreon-wrapper
```

## Usage Example

### Importing

CommonJS

```js
const { Patreon } = require('@anitrack/patreon-wrapper')
```

Typescript ES6

```js
import { Patreon } from '@anitrack/patreon-wrapper'
```

### Authorization

> Where do I find Campaign ID? F12 your Patreon page and search for "campaign" then keep looking until you finds URL with campaign params that contains around 7 degits. That should be your Campaign ID

```js
Patreon.Authorization({
    AccessToken: 'YOUR_API_V2_ACCESS_TOKEN',
    CampaignID: 'YOUR_CAPAIGN_ID',
})
```

### Fetching every Patrons on the Campaign

Promies then catch

```js
Patreon.FetchPatrons(['active_patron', 'declined_patron'])
    .then((Patrons) => {
        // Handle Patrons List
        console.log(Patrons)
    })
    .catch((err) => {
        // Handle Error
        console.log(err)
    })
```

Async/Await

```js
var Patrons = await Patreon.FetchPatrons(['active_patron', 'declined_patron'])

console.log(Patrons)
```

Clean Response Example

```js
 // Example response from fetching Patron list
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
          cents: 500, // 5 USD
          willPayCents: 500,
          lifetimeCents: 1500,
          firstCharge: '2022-01-15 15:00:00.000', // ISO 8601 DATE
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
    {
    ...
    },
    {
    ...
    }
]
```

<br />

## Sandboxing

> This is great for development and working with fake patrons users. The fake patrons object will be exactly the same as real ones!

### Importing Sandbox

```js
import { Patreon, Sandbox } from '@anitrack/patreon-wrapper'
```

### Adding Fake Patrons to the Sandbox

You can repeat this as much as you want

```js
Sandbox.AppendPatron({
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
    patronStatus: 'active_patron', // Can be 'active_patron' & 'declined_patron'
    mediaConnection: {
        patreon: {
            id: '123',
            url: 'https://www.patreon.com/api/oauth2/v2/user/user_id',
        },
        discord: { id: '123', url: 'https://discord.com/users/user_id' },
    },
})
```

### Viewing Fake Patrons Only

```js
Sandbox.GetFakePatrons()
```

### Viewing Fake Patrons + Real Patrons

Just fetch Patrons normally like you would with real ones

```js
Patreon.FetchPatrons(['active_patron', 'declined_patron'])
    .then((Patrons) => {
        console.dir(Patrons, { depth: null })
    })
    .catch((err) => {
        console.log(err)
    })
```

## License

[MIT](LICENSE)
