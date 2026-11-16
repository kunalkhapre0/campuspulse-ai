import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import crypto from 'node:crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const sfn = new SFNClient({});
const bedrock = new BedrockRuntimeClient({});

const EVENTS_TABLE = process.env.EVENTS_TABLE;
const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE;
const REPORTS_TABLE = process.env.REPORTS_TABLE;
const REPORTS_BUCKET = process.env.REPORTS_BUCKET;
const STATE_MACHINE_ARN = process.env.REPORT_STATE_MACHINE_ARN;
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20240620-v1:0';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const apiHandler = async (event) => {
  const routeKey = event.routeKey || `${event.requestContext?.http?.method} ${event.rawPath}`;

  try {
    if (routeKey === 'POST /events/{id}/reports') {
      const eventId = event.pathParameters?.id;
      const evtRes = await ddb.send(new GetCommand({ TableName: EVENTS_TABLE, Key: { id: eventId } }));
      if (!evtRes.Item) return json(404, { error: 'Event not found' });

      const reportId = `rep-${crypto.randomUUID().slice(0, 8)}`;
      const execution = await sfn.send(
        new StartExecutionCommand({
          stateMachineArn: STATE_MACHINE_ARN,
          input: JSON.stringify({ reportId, eventId }),
        })
      );

      const reportRecord = {
        id: reportId,
        eventId,
        eventName: evtRes.Item.title,
        status: 'RUNNING',
        source: 'aws-step-functions',
        executionArn: execution.executionArn,
        generatedAt: new Date().toISOString(),
        aiSummary: 'Step Functions execution in progress...',
        feedbackAnalysis: 'Aggregating attendee evaluations...',
        keyRecommendations: [],
      };

      await ddb.send(new PutCommand({ TableName: REPORTS_TABLE, Item: reportRecord }));
      return json(202, { report: reportRecord });
    }

    if (routeKey === 'GET /reports/{id}') {
      const reportId = event.pathParameters?.id;
      const repRes = await ddb.send(new GetCommand({ TableName: REPORTS_TABLE, Key: { id: reportId } }));
      if (!repRes.Item) return json(404, { error: 'Report not found' });

      const report = { ...repRes.Item };
      if (report.status === 'SUCCEEDED' && report.s3Key) {
        report.presignedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: REPORTS_BUCKET, Key: report.s3Key }),
          { expiresIn: 900 }
        );
      }
      return json(200, { report });
    }

    return json(404, { error: 'Route not found' });
  } catch (err) {
    console.error('Reports API error:', err);
    return json(500, { error: 'Failed to process report request' });
  }
};

export const workerHandler = async (input) => {
  const { step, reportId, eventId } = input;

  if (step === 'AGGREGATE_FEEDBACK') {
    const evtRes = await ddb.send(new GetCommand({ TableName: EVENTS_TABLE, Key: { id: eventId } }));
    const fbRes = await ddb.send(
      new QueryCommand({
        TableName: FEEDBACK_TABLE,
        KeyConditionExpression: 'eventId = :eid',
        ExpressionAttributeValues: { ':eid': eventId },
      })
    );
    const items = fbRes.Items || [];
    if (items.length === 0) throw new Error('No feedback available to synthesize.');
    return { event: evtRes.Item, feedback: items };
  }

  if (step === 'SYNTHESIZE_BEDROCK') {
    const { event, feedback } = input.aggregated;
    const prompt = `Summarize ${feedback.length} feedback submissions for "${event.title}" into JSON with keys: aiSummary (string), feedbackAnalysis (string), keyRecommendations (string[]).`;
    const res = await bedrock.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [
          {
            role: 'user',
            content: [{ text: `${prompt}\n\n${JSON.stringify(feedback)}` }],
          },
        ],
        inferenceConfig: { maxTokens: 900, temperature: 0.2 },
      })
    );
    const text = res.output?.message?.content?.[0]?.text || '{}';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  }

  if (step === 'WRITE_S3_AND_COMPLETE') {
    const s3Key = `reports/${eventId}/${reportId}.json`;
    const artifact = {
      reportId,
      eventId,
      eventName: input.aggregated.event.title,
      generatedAt: new Date().toISOString(),
      ...input.synthesis,
    };

    await s3.send(
      new PutObjectCommand({
        Bucket: REPORTS_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(artifact, null, 2),
        ContentType: 'application/json',
      })
    );

    await ddb.send(
      new UpdateCommand({
        TableName: REPORTS_TABLE,
        Key: { id: reportId },
        UpdateExpression:
          'SET #s = :status, aiSummary = :sum, feedbackAnalysis = :ana, keyRecommendations = :rec, s3Key = :key',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':status': 'SUCCEEDED',
          ':sum': artifact.aiSummary,
          ':ana': artifact.feedbackAnalysis,
          ':rec': artifact.keyRecommendations || [],
          ':key': s3Key,
        },
      })
    );
    return { status: 'SUCCEEDED', s3Key };
  }

  if (step === 'MARK_FAILED') {
    await ddb.send(
      new UpdateCommand({
        TableName: REPORTS_TABLE,
        Key: { id: reportId },
        UpdateExpression: 'SET #s = :status, errorMessage = :err',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: {
          ':status': 'FAILED',
          ':err': JSON.stringify(input.error || 'Step Functions execution failed'),
        },
      })
    );
  }

  return { ok: true };
};
