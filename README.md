# Patreon Wrapper 🍊
Discord Patreon Wrapper for [AniTrack](https://anitrack.co) on node.js

## Table of Contents
- [Installing](#installing)
- [Example](#example)
- [License](#license)

## Installing
Using NPM
```
$ npm install @anitrack/patreon-wrapper
```
Using YARN
```
$ yarn add @anitrack/patreon-wrapper
```

## Example

### Importing

CommonJS
```js
const { Patreon } = require('@AniTrack/patreon-wrapper')
```
Typescript ES6
```js
import { Patreon } from '@AniTrack/patreon-wrapper'
```

#### Authorization
```js
Patreon.Authorization({
    AccessToken: 'YOUR_API_V2_ACCESS_TOKEN',
    CampaignID: 'YOUR_CAPAIGN_ID',
})
```

### Fetching every Patrons on the Campaign

Promies then catch
```js
Patreon.FetchPatrons()
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
var Patrons = await Patreon.FetchPatrons()

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
          cents: 500, // 5 USD
          willPayCents: 500,
          lifetimeCents: 0,
          firstCharge: 'DATE',
          nextCharge: 'DATE',
          lastCharge: null
        }
      },
      mediaConnection: {
        patreon: {
          id: '12345678',
          url: 'https://www.patreon.com/api/oauth2/v2/user/70437054'       
        },
        discord: {
          id: 'DISCORD_USER_ID',
          url: 'https://discordapp.com/users/DISCORD_USER_ID'
        }
      }
    },
    {
    ...
    },
    {
    ...
    },
    {
    ...
    }
]
```

## License

[MIT](LICENSE)
