import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Info,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from 'lucide-react';
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
import type { CampusEvent, EventReport, StudentFeedback } from '@/src/types/campus';

interface ReportsPageProps {
  events: CampusEvent[];
  feedbackList: StudentFeedback[];
  reports: EventReport[];
  isLiveMode: boolean;
  onGenerateReport: (eventId: string) => Promise<{
    report: EventReport;
    mode: 'live' | 'demo';
  }>;
  onRefreshReport: (reportId: string) => Promise<void>;
}

export function ReportsPage({
  events,
  feedbackList,
  reports,
  isLiveMode,
  onGenerateReport,
  onRefreshReport,
}: ReportsPageProps) {
  const [targetEventId, setTargetEventId] = useState(
    events.find((e) => feedbackList.some((f) => f.eventId === e.id))?.id || events[0]?.id || ''
  );
  const [generating, setGenerating] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!targetEventId) return;
    setError(null);
    setNotice(null);
    setGenerating(true);
    try {
      const res = await onGenerateReport(targetEventId);
      setNotice(
        res.mode === 'live'
          ? `AWS Step Functions execution started (${res.report.executionArn || res.report.id}).`
          : `Demo preview report compiled locally for ${res.report.eventName}. Connect AWS API Gateway to execute real Step Functions + private S3 storage.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = async (reportId: string) => {
    setError(null);
    setRefreshingId(reportId);
    try {
      await onRefreshReport(reportId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh report status.');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDownload = (report: EventReport) => {
    setError(null);
    if (report.source === 'aws-step-functions' && report.presignedUrl) {
      const anchor = document.createElement('a');
      anchor.href = report.presignedUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.download = `${report.eventId}-report.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return;
    }

    if (report.source === 'aws-step-functions' && !report.presignedUrl) {
      setError('Presigned S3 URL is not yet available. Click Refresh Status first.');
      return;
    }

    // Demo Mode: explicitly labeled local synthetic artifact download (never misrepresented as S3)
    const demoPayload = {
      warning: 'DEMO MODE PREVIEW ARTIFACT — NOT STORED IN AMAZON S3',
      reportId: report.id,
      eventId: report.eventId,
      eventName: report.eventName,
      generatedAt: report.generatedAt,
      aiSummary: report.aiSummary,
      feedbackAnalysis: report.feedbackAnalysis,
      keyRecommendations: report.keyRecommendations,
    };
    const blob = new Blob([JSON.stringify(demoPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `DEMO-PREVIEW-${report.eventId}-report.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs font-medium text-orange-600">
          AWS Step Functions · Private Amazon S3
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Automated Event Reports
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Orchestrate multi-step Bedrock synthesis workflows via{' '}
          <span className="font-mono text-xs">POST /events/{'{id}'}/reports</span> and retrieve
          presigned private S3 download URLs via{' '}
          <span className="font-mono text-xs">GET /reports/{'{id}'}</span>.
        </p>
      </div>

      {!isLiveMode && (
        <Alert variant="warning">
          <Info className="h-4 w-4 shrink-0 text-amber-800 mt-0.5" />
          <AlertDescription className="text-xs sm:text-sm">
            <span className="font-semibold text-amber-950">Demo Mode Report Preview: </span>
            Reports generated here run locally on synthetic data. In production with{' '}
            <span className="font-mono">VITE_API_BASE_URL</span> configured, triggering a report
            starts an AWS Step Functions execution that writes to a private S3 bucket and issues
            short-lived presigned URLs.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {notice && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {/* Trigger Step Functions Workflow Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Event Report</CardTitle>
          <CardDescription>
            Select an event with collected attendee feedback to compile an executive summary and
            recommendation artifact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 max-w-md">
              <Select value={targetEventId} onValueChange={setTargetEventId}>
                <SelectTrigger aria-label="Select event for report generation">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((evt) => {
                    const count = feedbackList.filter((f) => f.eventId === evt.id).length;
                    return (
                      <SelectItem key={evt.id} value={evt.id}>
                        {evt.title} ({count} feedback)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="accent"
              onClick={() => void handleGenerate()}
              disabled={generating || !targetEventId}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isLiveMode ? 'Start Step Functions Report' : 'Preview Report Generation'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Generated Reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <FileText className="mx-auto h-9 w-9 text-slate-400" />
              <p className="mt-3 font-display text-base font-semibold text-slate-900">
                No automated reports generated yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Select an event above and start a report generation workflow.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-500">
                        <span className="font-mono">{report.id}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">
                          {new Date(report.generatedAt).toLocaleString()}
                        </span>
                        <span aria-hidden="true"> · </span>
                        <span>
                          {report.source === 'aws-step-functions'
                            ? 'AWS Step Functions + Private S3'
                            : 'Demo Preview'}
                        </span>
                      </p>
                      <CardTitle className="mt-1">{report.eventName}</CardTitle>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${
                          report.status === 'SUCCEEDED'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : report.status === 'RUNNING'
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        {report.status === 'SUCCEEDED' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {report.status === 'RUNNING' && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {report.status === 'FAILED' && <XCircle className="h-3.5 w-3.5" />}
                        {report.status}
                      </span>

                      {report.source === 'aws-step-functions' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleRefresh(report.id)}
                          disabled={refreshingId === report.id}
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              refreshingId === report.id ? 'animate-spin' : ''
                            }`}
                          />
                          Refresh Status
                        </Button>
                      )}

                      <Button
                        variant="default"
                        size="sm"
                        disabled={report.status !== 'SUCCEEDED'}
                        onClick={() => handleDownload(report)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        {report.source === 'aws-step-functions'
                          ? 'Download via Presigned URL'
                          : 'Download Demo JSON'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2 border-t border-slate-100">
                  {report.errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-700" />
                      <AlertDescription>{report.errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        AI Executive Summary
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{report.aiSummary}</p>
                      <h4 className="pt-2 font-display text-sm font-semibold text-slate-900">
                        Feedback Analysis
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {report.feedbackAnalysis}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display text-sm font-semibold text-slate-900">
                        Key Recommendations
                      </h4>
                      <ul className="space-y-2 text-sm text-slate-700 list-decimal pl-4">
                        {report.keyRecommendations.map((rec, index) => (
                          <li key={index} className="leading-relaxed">
                            {rec}
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 text-xs text-slate-500 space-y-1 font-mono">
                        {report.s3Key && <p>S3 Object Key: {report.s3Key}</p>}
                        {report.executionArn && <p className="truncate">Execution: {report.executionArn}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
