import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Info, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Skeleton } from '@/src/components/ui/skeleton';
import { campusApi } from '@/src/services/api';
import type { BedrockAnalyticsResult, CampusEvent } from '@/src/types/campus';

interface AiInsightsPageProps {
  events: CampusEvent[];
  selectedEventId: string;
  onSelectEventId: (eventId: string) => void;
  onOpenEventDetails: (eventId: string) => void;
}

export function AiInsightsPage({
  events,
  selectedEventId,
  onSelectEventId,
  onOpenEventDetails,
}: AiInsightsPageProps) {
  const [analytics, setAnalytics] = useState<BedrockAnalyticsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeEventId = selectedEventId || events[0]?.id || '';
  const activeEvent = events.find((e) => e.id === activeEventId);

  const loadAnalytics = async (eventId: string) => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await campusApi.getEventAnalytics(eventId);
      setAnalytics(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI analytics.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics(activeEventId);
  }, [activeEventId]);

  const totalSentiment = analytics
    ? analytics.sentimentCounts.positive +
      analytics.sentimentCounts.neutral +
      analytics.sentimentCounts.negative
    : 0;

  const pct = (count: number) =>
    totalSentiment > 0 ? Math.round((count / totalSentiment) * 100) : 0;

  const sentimentChartData = analytics
    ? [
        { name: 'Positive (4-5)', count: analytics.sentimentCounts.positive, fill: '#16a34a' },
        { name: 'Neutral (3)', count: analytics.sentimentCounts.neutral, fill: '#d97706' },
        { name: 'Negative (1-2)', count: analytics.sentimentCounts.negative, fill: '#dc2626' },
      ]
    : [];

  const dimensionChartData = analytics
    ? [
        { metric: 'Overall Rating', score: analytics.averageOverall },
        { metric: 'Event Quality', score: analytics.averageEventQuality },
        { metric: 'Speaker Quality', score: analytics.averageSpeakerQuality },
        { metric: 'Learning Experience', score: analytics.averageLearningExperience },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-orange-600">Amazon Bedrock Intelligence</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            AI Feedback Insights
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Structured satisfaction scores, sentiment distribution, repeated concerns, and theme
            synthesis from <span className="font-mono text-xs">GET /events/{'{id}'}/analytics</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Select value={activeEventId} onValueChange={onSelectEventId}>
              <SelectTrigger aria-label="Select campus event">
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((evt) => (
                  <SelectItem key={evt.id} value={evt.id}>
                    {evt.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadAnalytics(activeEventId)}
            disabled={loading || !activeEventId}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Explicit Provenance Banner */}
      {analytics && analytics.source === 'bedrock' && (
        <Alert variant="success">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
          <AlertDescription className="text-xs sm:text-sm">
            <span className="font-semibold text-emerald-950">Live Amazon Bedrock Output: </span>
            Synthesized via <span className="font-mono">{analytics.modelId}</span>
            {analytics.generatedAt && ` on ${new Date(analytics.generatedAt).toLocaleString()}`}.
          </AlertDescription>
        </Alert>
      )}

      {analytics && analytics.source === 'demo' && (
        <Alert variant="warning">
          <Info className="h-4 w-4 shrink-0 text-amber-800 mt-0.5" />
          <AlertDescription className="text-xs sm:text-sm">
            <span className="font-semibold text-amber-950">Demo Preview Data — Not Live Bedrock: </span>
            Sentiment counts and averages below are computed from the synthetic demo feedback entries
            for this session. Connect your AWS API Gateway URL to invoke live Amazon Bedrock models.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : analytics && analytics.source === 'unavailable' ? (
        <Card>
          <CardContent className="p-10 text-center max-w-xl mx-auto">
            <Sparkles className="mx-auto h-9 w-9 text-slate-400" />
            <h2 className="mt-3 font-display text-lg font-semibold text-slate-900">
              AI Analysis Unavailable for {activeEvent?.title || 'Selected Event'}
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {analytics.unavailableReason ||
                'No student feedback has been recorded for this event yet. Analysis requires at least one verified feedback response.'}
            </p>
            {activeEvent && (
              <Button
                variant="accent"
                size="sm"
                className="mt-5"
                onClick={() => onOpenEventDetails(activeEvent.id)}
              >
                Open Event & Submit Feedback
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        analytics && (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-slate-500">Analyzed Responses</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {analytics.responseCount}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-slate-500">Overall Satisfaction</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {analytics.averageOverall} / 5
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-slate-500">Positive Sentiment</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-emerald-700 tabular-nums">
                    {pct(analytics.sentimentCounts.positive)}%
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
                    {analytics.sentimentCounts.positive} of {totalSentiment} responses
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-slate-500">Negative Sentiment</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-red-600 tabular-nums">
                    {pct(analytics.sentimentCounts.negative)}%
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
                    {analytics.sentimentCounts.negative} of {totalSentiment} responses
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Event Summary</CardTitle>
                <CardDescription>
                  Data source: {analytics.source === 'bedrock' ? 'Amazon Bedrock' : 'Demo Preview Dataset'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                  {analytics.executiveSummary}
                </p>
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>
                    Positive, neutral, and negative counts derived from submitted evaluations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sentimentChartData}
                        margin={{ top: 10, right: 16, left: -12, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {sentimentChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Satisfaction Dimensions</CardTitle>
                  <CardDescription>Mean score across the four structured feedback scales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dimensionChartData}
                        layout="vertical"
                        margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" domain={[0, 5]} tick={{ fill: '#475569', fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="metric"
                          width={130}
                          tick={{ fill: '#334155', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="score" fill="#ea580c" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Themes, Concerns, Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Common Feedback Themes</CardTitle>
                  <CardDescription>Recurring topics extracted across written responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.themes.map((item) => (
                    <div
                      key={item.theme}
                      className="pb-3 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      <p className="text-sm font-medium text-slate-900">{item.theme}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">{item.mentions} mentions</span>
                        <span aria-hidden="true"> · </span>
                        <span
                          className={
                            item.sentiment === 'positive'
                              ? 'text-emerald-700 font-medium'
                              : item.sentiment === 'negative'
                              ? 'text-red-600 font-medium'
                              : 'text-amber-700 font-medium'
                          }
                        >
                          {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)} tone
                        </span>
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Repeated Concerns</CardTitle>
                  <CardDescription>Friction points surfaced by multiple attendees</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics.repeatedConcerns.length === 0 ? (
                    <p className="text-sm text-slate-500">No repeated concerns identified.</p>
                  ) : (
                    <ul className="space-y-3 text-sm text-slate-700 list-disc pl-4">
                      {analytics.repeatedConcerns.map((concern, i) => (
                        <li key={i} className="leading-relaxed">
                          {concern}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Recommendations</CardTitle>
                  <CardDescription>Actionable next steps for event organizers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-700 list-decimal pl-4">
                    {analytics.recommendations.map((rec, i) => (
                      <li key={i} className="leading-relaxed">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      )}
    </div>
  );
}
