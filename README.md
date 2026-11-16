# CampusPulse AI — Serverless Campus Event Intelligence Platform

**CampusPulse AI** is a serverless university event management, registration, structured feedback, and Amazon Bedrock analytics platform built for the **AWS Builder Center Weekend Challenge: No Pipeline, No Problem**.

## Core Capabilities

- **Event Discovery & Capacity Control**: Filterable campus event catalog with search, category tabs, and atomic duplicate-safe seat registration.
- **Student Dashboard**: Track confirmed registrations, upcoming sessions, past attendance, and submit structured four-dimension evaluations.
- **Organizer Studio**: Aggregate registration vs. capacity analytics, attendance statistics, event creation (`POST /events`), and operational controls.
- **Amazon Bedrock AI Insights**: Sentiment distribution, theme extraction, repeated attendee concerns, and improvement recommendations (`GET /events/{id}/analytics`), with explicit provenance distinguishing live Bedrock responses from synthetic Demo Mode previews.
- **Automated S3 Reporting via AWS Step Functions**: Trigger multi-step synthesis workflows (`POST /events/{id}/reports`), poll execution status, and download private S3 artifacts via short-lived presigned URLs (`GET /reports/{id}`).

## Technology Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (Radix UI primitives)
- Lucide React icons
- Recharts data visualizations

### AWS Serverless Backend (`/aws-backend`)
- **Amazon API Gateway (HTTP API)**
- **AWS Lambda (Node.js 20 ESM)**
- **Amazon DynamoDB** (`Events`, `Registrations`, `Feedback`, `Reports`)
- **Amazon Bedrock** (`ConverseCommand`)
- **AWS Step Functions** (`statemachine/report-workflow.asl.json`)
- **Amazon S3** (Private bucket with `BlockPublicAcls` + Presigned URLs)

---

## Quick Start (Frontend)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   - Leave `VITE_API_BASE_URL` empty to run in **explicitly labeled Demo Mode** with synthetic university data.
   - Set `VITE_API_BASE_URL` to your deployed AWS API Gateway Invoke URL to connect live AWS services.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## Deploying the AWS Backend

The deployable serverless backend lives in `/aws-backend`.

### Prerequisites
- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed
- Amazon Bedrock model access enabled in your target region (e.g., `us-east-1`)

### Deploy Steps

```bash
cd aws-backend
npm install
sam build
sam deploy --guided
```

During `sam deploy --guided`, note the `ApiEndpoint` output value, then set it in `.env.local`:

```bash
VITE_API_BASE_URL="https://<your-api-id>.execute-api.<region>.amazonaws.com"
```

You can also connect and test `GET /health` at runtime from the **AWS Architecture** page inside the app.

---

## API Contract

| Method & Path | Handler | Purpose |
|---|---|---|
| `GET /health` | `events.handler` | Health check and region metadata |
| `GET /events` | `events.handler` | List campus events from DynamoDB |
| `POST /events` | `events.handler` | Create a new campus event |
| `POST /events/{id}/register` | `events.handler` | Atomic DynamoDB transaction preventing duplicate & full bookings |
| `POST /events/{id}/feedback` | `events.handler` | Record structured 4-metric + written attendee feedback |
| `GET /events/{id}/analytics` | `analytics.handler` | Aggregate metrics & run Amazon Bedrock synthesis |
| `POST /events/{id}/reports` | `reports.apiHandler` | Start AWS Step Functions report generation workflow |
| `GET /reports/{id}` | `reports.apiHandler` | Fetch report status and issue private S3 presigned URL |

---

## Security & Demo Mode Policy

- **No Secrets in Frontend Code**: Never place AWS IAM credentials or private keys in `.env` `VITE_*` variables or browser storage.
- **Private S3 Reports**: All report artifacts reside in an S3 bucket with public access blocked; downloads use time-limited presigned URLs.
- **Explicit Demo Mode**: When `VITE_API_BASE_URL` is unset, CampusPulse AI clearly marks all views and reports as synthetic Demo Mode previews rather than claiming live AWS execution.
