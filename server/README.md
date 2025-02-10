# Setup

1. `npm install`
2. Create a PostgreSQL database, or use an existing one from the previous exercises.
3. Setup `.env` file based on `.env.example` files.

## Slack Bot Setup

### Creating a Slack Bot Token
1. Go to the [Slack API website](https://api.slack.com/).
2. Click on **"Create an App"**.
3. Choose **"From scratch"**, then provide a name for your app and select a Slack workspace where you want to use it.
4. Navigate to the **OAuth & Permissions** page from the left sidebar.
5. Scroll down to **Scopes**, under **Bot Token Scopes**, and add the required permissions your bot will need (e.g., `chat:write`, `channels:read`, `groups:read`, etc.).
6. After setting the scopes, click **Install App to Workspace** at the top of the page and follow the prompts.
7. Once installed, you will see the **Bot User OAuth Token**. Copy this token and save it in your `.env` file as `SLACK_BOT_TOKEN`.

### Retrieving the Slack Channel ID
1. In your Slack workspace, go to the channel where you want the bot to operate.
2. Click on the channel name at the top to open the channel details.
3. Scroll to the bottom and click **"More"** > **"Copy Channel ID"**.
4. Paste this channel ID into your `.env` file as `SLACK_CHANNEL_ID`.

## Google Apps Password Setup

### Creating Google App Passwords
1. Go to your [Google Account Security settings](https://myaccount.google.com/security).
2. Under the **"Signing in to Google"** section, ensure that 2-Step Verification is enabled.
3. Once 2-Step Verification is enabled, you will see the option for **"App Passwords"**. Click on it.
4. Sign in with your Google account again if prompted.
5. Under **Select the app and device you want to generate the app password for**, choose **"Other (Custom name)"** and enter a name (e.g., "MyAppServer").
6. Click **Generate** to create an app password. Copy the generated password.
7. Add this password to your `.env` file as `GOOGLE_APP_PASSWORD`.
8. Use the app password with your gmail account for sharing boards. Create an additional app password for sending password reset links

## Running the project in development

```bash
# automatically restarts the server
npm run dev


## Running the project in development

```bash
# automatically restarts the server
npm run dev
```

## Tests

```bash
# back end tests
npm test
```

## Migrations

```bash
# prepare a migration
npm run migrate:new myMigrationName

# migrate up to the latest migration
npm run migrate:latest
```

## Running the server in production

Server:

```bash
npm run build
npm run start

# or migrate + start
npm run prod
```
