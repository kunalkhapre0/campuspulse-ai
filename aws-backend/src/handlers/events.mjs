import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import crypto from 'node:crypto';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const EVENTS_TABLE = process.env.EVENTS_TABLE;
const REGISTRATIONS_TABLE = process.env.REGISTRATIONS_TABLE;
const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE;

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  const routeKey = event.routeKey || `${event.requestContext?.http?.method} ${event.rawPath}`;

  try {
    if (routeKey === 'GET /health') {
      return json(200, {
        status: 'ok',
        service: 'CampusPulse AI Serverless API',
        region: process.env.AWS_REGION || 'us-east-1',
        timestamp: new Date().toISOString(),
      });
    }

    if (routeKey === 'GET /events') {
      const result = await ddb.send(new ScanCommand({ TableName: EVENTS_TABLE }));
      const events = (result.Items || []).sort((a, b) => a.date.localeCompare(b.date));
      return json(200, { events });
    }

    if (routeKey === 'POST /events') {
      const body = JSON.parse(event.body || '{}');
      if (!body.title || !body.date || !body.venue || !body.capacity) {
        return json(400, { error: 'title, date, venue, and capacity are required.' });
      }

      const item = {
        id: `evt-${crypto.randomUUID().slice(0, 8)}`,
        title: String(body.title).trim(),
        description: String(body.description || '').trim(),
        category: body.category || 'Cloud & Serverless',
        date: body.date,
        startTime: body.startTime || '14:00',
        endTime: body.endTime || '16:00',
        venue: String(body.venue).trim(),
        capacity: Number(body.capacity),
        registeredCount: 0,
        checkedInCount: 0,
        organizerName: String(body.organizerName || 'Campus Organizer').trim(),
        organizerEmail: String(body.organizerEmail || '').trim(),
        organizerDepartment: String(body.organizerDepartment || 'University').trim(),
        status: 'upcoming',
        schedule: Array.isArray(body.schedule) ? body.schedule : [],
        createdAt: new Date().toISOString(),
      };

      await ddb.send(new PutCommand({ TableName: EVENTS_TABLE, Item: item }));
      return json(201, { event: item });
    }

    if (routeKey === 'POST /events/{id}/register') {
      const eventId = event.pathParameters?.id;
      const body = JSON.parse(event.body || '{}');
      const email = String(body.studentEmail || '').trim().toLowerCase();

      if (!eventId || !email || !body.studentName || !body.studentId) {
        return json(400, { error: 'studentName, studentEmail, and studentId are required.' });
      }

      const registration = {
        pk: `${eventId}#${email}`,
        id: `reg-${crypto.randomUUID().slice(0, 8)}`,
        eventId,
        studentName: String(body.studentName).trim(),
        studentEmail: email,
        studentId: String(body.studentId).trim(),
        department: String(body.department || 'General Studies').trim(),
        status: 'confirmed',
        registeredAt: new Date().toISOString(),
      };

      try {
        await ddb.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Put: {
                  TableName: REGISTRATIONS_TABLE,
                  Item: registration,
                  ConditionExpression: 'attribute_not_exists(pk)',
                },
              },
              {
                Update: {
                  TableName: EVENTS_TABLE,
                  Key: { id: eventId },
                  UpdateExpression: 'SET registeredCount = registeredCount + :inc',
                  ConditionExpression: 'attribute_exists(id) AND registeredCount < capacity',
                  ExpressionAttributeValues: { ':inc': 1 },
                },
              },
            ],
          })
        );
      } catch (err) {
        if (err.name === 'TransactionCanceledException') {
          return json(409, {
            error: 'Registration rejected: duplicate email, missing event, or full capacity.',
          });
        }
        throw err;
      }

      const updated = await ddb.send(new GetCommand({ TableName: EVENTS_TABLE, Key: { id: eventId } }));
      return json(201, { registration, event: updated.Item });
    }

    if (routeKey === 'POST /events/{id}/feedback') {
      const eventId = event.pathParameters?.id;
      const body = JSON.parse(event.body || '{}');

      if (!eventId || !body.writtenFeedback || String(body.writtenFeedback).trim().length < 10) {
        return json(400, { error: 'Valid eventId and writtenFeedback (>= 10 chars) required.' });
      }

      const feedback = {
        eventId,
        id: `fb-${crypto.randomUUID().slice(0, 8)}`,
        studentName: String(body.studentName || 'Campus Attendee').trim(),
        studentEmail: String(body.studentEmail || '').trim().toLowerCase(),
        overallRating: Number(body.overallRating),
        eventQuality: Number(body.eventQuality),
        speakerQuality: Number(body.speakerQuality),
        learningExperience: Number(body.learningExperience),
        writtenFeedback: String(body.writtenFeedback).trim(),
        suggestions: String(body.suggestions || '').trim(),
        submittedAt: new Date().toISOString(),
      };

      await ddb.send(new PutCommand({ TableName: FEEDBACK_TABLE, Item: feedback }));
      return json(201, { feedback });
    }

    return json(404, { error: 'Route not found' });
  } catch (err) {
    console.error('Events handler error:', err);
    return json(500, { error: 'Internal server error' });
  }
};
