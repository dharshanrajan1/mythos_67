# Sam Nutrition Agent

Lean backend scaffold for an SMS-first nutrition logging agent.

## Stack

- Fastify API
- Prisma + Postgres
- Twilio for SMS/MMS
- Cloudflare R2 for image storage

## Run locally

1. Copy `.env.example` to `.env`
2. Fill in at least `DATABASE_URL`
3. Install dependencies
4. Run Prisma generate and migrations
5. Start the dev server

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## What You Need

- A Postgres database
- A Twilio phone number with SMS enabled
- A public webhook URL for local development
- An OpenAI API key when you replace the placeholder nutrition resolver
- An R2 bucket when you want to persist inbound meal images

## Fastest Setup Path

1. Create a Postgres database in Railway or Neon and paste the connection string into `DATABASE_URL`.
2. Create a Twilio account and buy one SMS-enabled number.
3. Start a public tunnel to your local server with `ngrok http 3000`.
4. In Twilio, set the inbound webhook for your number to `https://<your-ngrok-url>/webhooks/twilio/inbound`.
5. Add your Twilio credentials to `.env`.
6. Run `npm run prisma:migrate`.
7. Run `npm run dev`.

## Local SMS Simulator

If you do not have Twilio set up yet, you can test the core flow locally by posting JSON to:

`POST /simulate/sms`

Example:

```bash
curl -X POST http://localhost:3000/simulate/sms \
  -H "content-type: application/json" \
  -d '{
    "from": "+15555550123",
    "body": "chicken burrito bowl and chips"
  }'
```

Send the same `from` number repeatedly to simulate a single user thread through onboarding and meal logging.

## Terminal Chat Simulator

If you do not want to make API calls, run:

```bash
npm run chat
```

Optional custom numbers:

```bash
npm run chat -- +15555550123 +15555550000
```

Inside the simulator:

- type normal messages to simulate inbound SMS
- use `/reset` to wipe that simulated user's data
- use `/exit` to quit

## Required Environment Variables

- `DATABASE_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

## Optional Environment Variables

- `OPENAI_API_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`
- `USDA_API_KEY`

## Current scope

- Health endpoint
- Twilio inbound webhook
- Basic onboarding gate
- Placeholder meal ingestion pipeline
- Daily rollup and progress replies

## Next steps

- Add Twilio request signature validation
- Replace placeholder nutrition resolver with multimodal extraction + USDA lookup
- Fetch and store inbound media in R2
- Expand onboarding into a real state machine
- Add daily and weekly scheduled jobs
