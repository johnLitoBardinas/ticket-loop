# tl-webhook

Webhook microservice for Ticket Loop. Receives ticket creation events from the API and sends email notifications to administrators via Brevo.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment. Lightweight and well-suited for I/O-bound webhook services that spend most of their time waiting on network calls (receiving HTTP requests, sending emails) rather than doing heavy computation. |
| **Express v5** | HTTP framework. Minimal overhead for defining webhook endpoints. Express is the most widely adopted Node.js framework, making it easy to onboard contributors and find solutions. |
| **Brevo SDK (`@getbrevo/brevo`)** | Transactional email delivery. Provides a managed email API so the service doesn't need to run its own SMTP server, handle deliverability, or manage DNS records (SPF/DKIM). |
| **dotenv** | Environment variable management. Loads secrets (API keys, email addresses) from a `.env` file during local development, keeping credentials out of source control. |

## How It Works

1. The API service (`tl-api`) creates a ticket and sends a POST request to `/api/webhook/ticket-created`.
2. The webhook validates required fields, logs the payload to a daily file under `logs/`, and sends an HTML notification email to the configured admin address via Brevo.
3. Returns a JSON response indicating whether the email was sent successfully.

## Running

Tested on **Node.js v18.13.0**.

```bash
npm install
npm start        # Starts on PORT from .env or default 9999
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `9999`) |
| `BREVO_API_KEY` | API key for Brevo transactional email |
| `SENDER_EMAIL` | "From" email address for notifications |
| `ADMIN_EMAIL` | Recipient email for ticket notifications |
