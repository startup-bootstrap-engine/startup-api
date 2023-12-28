# Patreon Setup

This document provides instructions on how to set up Patreon for your application.

## Prerequisites

Before you begin, you need to have a Patreon creator account. If you don't have one, you can create it on the [Patreon website](https://www.patreon.com/).

## Creating a Patreon App

1. Log in to your Patreon account.
2. Go to the [Patreon Register Clients page](https://www.patreon.com/portal/registration/register-clients).
3. Click on the "Create new Client" button.
4. Fill in the required fields:

- **App Name**: The name of your application.
- **App Description**: A brief description of your application.
- **App Category**: The category that best fits your application.
- **Redirect URIs**: The URI where users will be redirected after they authorize your application. This should match the `PATREON_REDIRECT_URI` in your `.env` file.

5. Click on "Create Client".

After creating the client, you will be provided with a `Client ID` and a `Client Secret`.

## Updating the .env File

Open the `.env` file in your project and update the following variables:

```markdown
PATREON_CLIENT_ID="Your Patreon Client ID"
PATREON_CLIENT_SECRET="Your Patreon Client Secret"
PATREON_REDIRECT_URI="Your Redirect URI"
PATREON_CAMPAIGN_ID="Your Patreon Campaign ID"

PATREON_ACCESS_TOKEN="Check the Authentication step"
PATREON_REFRESH_TOKEN="Check the Authentication step"
PATREON_ACCESS_TOKEN_EXPIRATION="Check the Authentication step"
```

Replace "Your Patreon Client ID", "Your Patreon Client Secret", "Your Redirect URI", and "Your Patreon Campaign ID" with the actual values.

### Authenticating

Only on the first time, you will need to authenticate your application with Patreon. To do so, access the following route:

```markdown
/patreon/authenticate
```

This will return the access token, refresh token, and expiration time. You will need to update the `.env` file with these values.

### Getting the Campaign ID

`Turn on the API` and access this route, so you can fetch this info to update the .env file:

```markdown
/patreon/campaigns
```

Tip: Try doing the request using the `patreon.http` REST API client file

## Conclusion

After following these steps, your application should be ready to interact with the Patreon API. Make sure to keep your Client ID and Client Secret secure and do not share them with anyone.

You can check further information on the following files:

```markdown
PatreonController.ts
PatreonAPI.ts
```
