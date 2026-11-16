# CampusPulse AI — AWS Serverless Architecture

## 1. Problem Statement

University clubs, research centers, and engineering departments run dozens of technical workshops, hackathons, and meetups every semester. Organizers rely on fragmented forms and manual spreadsheets, leading to:
- Oversubscribed rooms and duplicate registrations.
- Low post-event visibility beyond raw 5-star averages.
- Hours spent manually reading qualitative feedback without systematic theme extraction.
- Inconsistent post-event reporting shared over insecure public links.

## 2. Solution Architecture

CampusPulse AI implements a zero-idle, event-driven serverless architecture on AWS:

```text
React + Vite Frontend (Centralized API Client)
        │
        ▼ HTTPS (CORS + Optional Cognito JWT Authorizer)
Amazon API Gateway (HTTP API)
        ├── GET  /health               ──▶ Events Lambda
        ├── GET  /events               ──▶ Events Lambda ──▶ DynamoDB (EventsTable)
        ├── POST /events               ──▶ Events Lambda ──▶ DynamoDB (EventsTable)
        ├── POST /events/{id}/register ──▶ Events Lambda ──▶ DynamoDB TransactWrite (Events + Registrations)
        ├── POST /events/{id}/feedback ──▶ Events Lambda ──▶ DynamoDB (FeedbackTable)
        ├── GET  /events/{id}/analytics──▶ Analytics Lambda ──▶ DynamoDB + Amazon Bedrock
        ├── POST /events/{id}/reports  ──▶ Reports API Lambda ──▶ AWS Step Functions
        └── GET  /reports/{id}         ──▶ Reports API Lambda ──▶ DynamoDB + Private S3 Presigned URL
```

## 3. Step Functions Report Workflow (`/aws-backend/statemachine/report-workflow.asl.json`)

When an organizer triggers `POST /events/{id}/reports`:
1. `ReportsApiFunction` creates a `RUNNING` metadata row in `ReportsTable` and invokes `StartExecution` on `ReportStateMachine`.
2. **State 1 — `AggregateFeedback`**: Reads the event metadata and all feedback rows from DynamoDB.
3. **State 2 — `SynthesizeWithBedrock`**: Invokes Amazon Bedrock (`ConverseCommand`) with low temperature (`0.2`) to produce structured `aiSummary`, `feedbackAnalysis`, and `keyRecommendations`.
4. **State 3 — `PersistToPrivateS3`**: Writes the JSON report artifact to the encrypted, public-access-blocked `ReportsBucket` (`reports/{eventId}/{reportId}.json`) and updates `ReportsTable` to `SUCCEEDED`.
5. **Failure Catch — `MarkReportFailed`**: Any unhandled error transitions the report record to `FAILED` with the serialized error details.

## 4. Security Controls

- **Atomic Duplicate & Capacity Guardrails**: `POST /events/{id}/register` executes a DynamoDB `TransactWriteCommand` checking `attribute_not_exists(pk)` (`{eventId}#{email}`) and `registeredCount < capacity` in a single atomic transaction.
- **Private S3 Storage**: `ReportsBucket` enables `BlockPublicAcls`, `BlockPublicPolicy`, `IgnorePublicAcls`, `RestrictPublicBuckets`, and AES-256 server-side encryption.
- **Presigned URL Delivery**: `GET /reports/{id}` issues a 15-minute (`900s`) S3 presigned URL only after verifying report completion.
- **Cognito Authorization**: Organizer mutations (`POST /events`, `POST /events/{id}/reports`) are designed to attach an Amazon Cognito JWT authorizer in API Gateway rather than using any client-side password gate.
