import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const bedrock = new BedrockRuntimeClient({});

const EVENTS_TABLE = process.env.EVENTS_TABLE;
const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE;
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-5-sonnet-20240620-v1:0';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  try {
    const eventId = event.pathParameters?.id;
    if (!eventId) return json(400, { error: 'Missing event id' });

    const eventRes = await ddb.send(new GetCommand({ TableName: EVENTS_TABLE, Key: { id: eventId } }));
    if (!eventRes.Item) return json(404, { error: 'Event not found' });

    const fbRes = await ddb.send(
      new QueryCommand({
        TableName: FEEDBACK_TABLE,
        KeyConditionExpression: 'eventId = :eid',
        ExpressionAttributeValues: { ':eid': eventId },
      })
    );

    const entries = fbRes.Items || [];
    if (entries.length === 0) {
      return json(200, {
        eventId,
        source: 'unavailable',
        modelId: MODEL_ID,
        generatedAt: null,
        responseCount: 0,
        averageOverall: 0,
        averageEventQuality: 0,
        averageSpeakerQuality: 0,
        averageLearningExperience: 0,
        sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
        themes: [],
        repeatedConcerns: [],
        recommendations: [],
        executiveSummary: '',
        unavailableReason: 'No feedback responses have been submitted for this event yet.',
      });
    }

    const avg = (k) =>
      Number((entries.reduce((acc, item) => acc + Number(item[k] || 0), 0) / entries.length).toFixed(2));

    const sentimentCounts = entries.reduce(
      (acc, item) => {
        if (item.overallRating >= 4) acc.positive += 1;
        else if (item.overallRating === 3) acc.neutral += 1;
        else acc.negative += 1;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    );

    const prompt = [
      `Analyze feedback for university event "${eventRes.Item.title}".`,
      `Return valid JSON with keys: executiveSummary (string), themes (array of {theme, mentions, sentiment}), repeatedConcerns (string[]), recommendations (string[]).`,
      `Responses:\n${entries
        .map(
          (f, i) =>
            `${i + 1}. Rating ${f.overallRating}/5 | Feedback: ${f.writtenFeedback} | Suggestions: ${f.suggestions}`
        )
        .join('\n')}`,
    ].join('\n\n');

    const bedrockResponse = await bedrock.send(
      new ConverseCommand({
        modelId: MODEL_ID,
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 900, temperature: 0.2 },
      })
    );

    const rawText = bedrockResponse.output?.message?.content?.[0]?.text || '{}';
    const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return json(200, {
      eventId,
      source: 'bedrock',
      modelId: MODEL_ID,
      generatedAt: new Date().toISOString(),
      responseCount: entries.length,
      averageOverall: avg('overallRating'),
      averageEventQuality: avg('eventQuality'),
      averageSpeakerQuality: avg('speakerQuality'),
      averageLearningExperience: avg('learningExperience'),
      sentimentCounts,
      themes: parsed.themes || [],
      repeatedConcerns: parsed.repeatedConcerns || [],
      recommendations: parsed.recommendations || [],
      executiveSummary: parsed.executiveSummary || '',
    });
  } catch (err) {
    console.error('Analytics handler error:', err);
    return json(500, { error: 'Failed to run Amazon Bedrock feedback analytics.' });
  }
};
