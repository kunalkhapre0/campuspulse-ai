import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileArchive,
  Globe,
  Loader2,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  XCircle,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import {
  campusApi,
  getConfiguredApiBaseUrl,
  setRuntimeApiBaseUrl,
} from '@/src/services/api';
import type { HealthCheckResponse } from '@/src/types/campus';

interface ArchitecturePageProps {
  onConnectionChanged: () => Promise<void>;
}

const AWS_SERVICES = [
  {
    name: 'Amazon API Gateway (HTTP API)',
    icon: Globe,
    role: 'Stateless HTTPS edge routing & Cognito JWT authorization',
    details:
      'Routes GET/POST endpoints with CORS enforcement, payload throttling, and zero idle server overhead.',
  },
  {
    name: 'AWS Lambda (Node.js 20)',
    icon: Server,
    role: 'Event operations, capacity validation, analytics & report triggers',
    details:
      'Executes isolated handlers for event CRUD, duplicate-safe registration, feedback validation, and Bedrock orchestration.',
  },
  {
    name: 'Amazon DynamoDB',
    icon: Database,
    role: 'Sub-second NoSQL persistence with conditional writes',
    details:
      'Stores events, registrations, feedback, and report metadata with atomic capacity decrements and duplicate checks.',
  },
  {
    name: 'Amazon Bedrock',
    icon: Sparkles,
    role: 'Qualitative feedback synthesis & theme extraction',
    details:
      'Processes verified attendee comments to surface recurring praise, friction points, and concrete organizer actions.',
  },
  {
    name: 'AWS Step Functions',
    icon: Workflow,
    role: 'Fault-tolerant report workflow orchestration',
    details:
      'Coordinates feedback aggregation, Bedrock synthesis, S3 artifact rendering, and DynamoDB status updates with retries.',
  },
  {
    name: 'Amazon S3 (Private Bucket)',
    icon: FileArchive,
    role: 'Encrypted report storage with presigned download URLs',
    details:
      'Blocks all public access (BlockPublicAcls) and serves authorized report downloads through short-lived presigned URLs.',
  },
];

export function ArchitecturePage({ onConnectionChanged }: ArchitecturePageProps) {
  const [endpointInput, setEndpointInput] = useState(getConfiguredApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [healthResult, setHealthResult] = useState<HealthCheckResponse | null>(null);

  const handleTestEndpoint = async (e: FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setRuntimeApiBaseUrl(endpointInput);
    const result = await campusApi.getHealth();
    setHealthResult(result);
    await onConnectionChanged();
    setTesting(false);
  };

  const handleSwitchToDemo = async () => {
    setEndpointInput('');
    setRuntimeApiBaseUrl('');
    const result = await campusApi.getHealth();
    setHealthResult(result);
    await onConnectionChanged();
  };

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs font-medium text-orange-600">
          AWS Builder Center Weekend Challenge · Competition Presentation
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Serverless AWS Architecture & API Inspector
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-3xl">
          Exact production architecture implemented in <span className="font-mono text-xs">/aws-backend</span>,
          including live API Gateway health verification and transparent Demo Mode controls.
        </p>
      </div>

      {/* Live API Gateway Connection Inspector */}
      <Card>
        <CardHeader>
          <CardTitle>AWS API Gateway Endpoint Connection</CardTitle>
          <CardDescription>
            Connect a deployed Amazon API Gateway HTTP API Invoke URL to switch from Demo Mode to
            live AWS operations (session-only, no credentials stored in browser storage).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleTestEndpoint} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="api-base-url" className="sr-only">
                AWS API Gateway Base URL
              </Label>
              <Input
                id="api-base-url"
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="https://abc123xyz.execute-api.us-east-1.amazonaws.com"
                className="font-mono text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" variant="accent" disabled={testing}>
              {testing && <Loader2 className="h-4 w-4 animate-spin" />}
              Connect & Test /health
            </Button>
            {getConfiguredApiBaseUrl() && (
              <Button type="button" variant="outline" onClick={() => void handleSwitchToDemo()}>
                Revert to Demo Mode
              </Button>
            )}
          </form>

          {healthResult && (
            <Alert variant={healthResult.ok ? (healthResult.mode === 'live' ? 'success' : 'info') : 'destructive'}>
              {healthResult.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <AlertDescription className="text-xs sm:text-sm space-y-1">
                <p className="font-semibold">
                  {healthResult.mode === 'demo'
                    ? 'Demo Mode Active (No external AWS API Gateway URL configured)'
                    : healthResult.ok
                    ? `Live AWS Backend Connected (${healthResult.latencyMs}ms)`
                    : 'Unable to reach AWS API Gateway /health endpoint'}
                </p>
                <p className="font-mono text-xs opacity-90">
                  Endpoint: {healthResult.endpoint}
                  {healthResult.region ? ` · Region: ${healthResult.region}` : ''}
                </p>
                {healthResult.error && <p className="text-xs">{healthResult.error}</p>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Problem, Solution, Real-World Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>01. Problem Statement</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            University clubs and engineering departments manage dozens of workshops and hackathons
            using disconnected forms and manual spreadsheets. Organizers face oversubscribed rooms,
            low survey completion, and hours spent manually reading feedback without extracting
            recurring themes.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>02. Serverless Solution</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            CampusPulse AI replaces brittle servers and manual reporting with a zero-idle AWS
            serverless pipeline. Event registrations enforce atomic DynamoDB capacity checks, while
            Amazon Bedrock and AWS Step Functions turn raw student feedback into structured
            executive reports in private S3 storage.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>03. Real-World Impact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            Campus teams eliminate manual post-event synthesis, prevent duplicate seat bookings,
            protect student privacy inside private S3 buckets, and scale effortlessly from 20-person
            coding labs to 500-seat university summits on a pay-per-request cost model.
          </CardContent>
        </Card>
      </div>

      {/* Exact Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Implemented Serverless Data Flow</CardTitle>
          <CardDescription>
            Matches the exact API contract and AWS SAM infrastructure defined in /aws-backend/template.yaml
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
            {[
              {
                title: 'React + Vite UI',
                sub: 'Centralized API Client',
                detail: 'Validates inputs and calls 8 RESTful HTTP endpoints.',
              },
              {
                title: 'API Gateway HTTP',
                sub: 'CORS + Cognito JWT',
                detail: 'Authenticates organizer mutations and routes traffic.',
              },
              {
                title: 'AWS Lambda',
                sub: 'Node.js 20 Handlers',
                detail: 'Executes events, registration, feedback & analytics logic.',
              },
              {
                title: 'DynamoDB + Bedrock',
                sub: 'State & AI Synthesis',
                detail: 'Conditional writes + foundation model theme extraction.',
              },
              {
                title: 'Step Functions + S3',
                sub: 'Private Report Artifacts',
                detail: 'Orchestrates report builds and issues presigned URLs.',
              },
            ].map((node, index, arr) => (
              <div key={node.title} className="flex items-stretch gap-2">
                <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
                  <div>
                    <p className="font-mono text-[11px] font-medium text-orange-600">
                      STAGE 0{index + 1}
                    </p>
                    <h3 className="mt-1 font-display text-sm font-semibold text-slate-900">
                      {node.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-600">{node.sub}</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 leading-relaxed">{node.detail}</p>
                </div>
                {index < arr.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-slate-400">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AWS Services Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {AWS_SERVICES.map((svc) => {
          const Icon = svc.icon;
          return (
            <Card key={svc.name}>
              <CardHeader className="pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-orange-400">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="pt-2 text-base">{svc.name}</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-700">
                  {svc.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                {svc.details}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Contract Table */}
      <Card>
        <CardHeader>
          <CardTitle>Backend API Contract</CardTitle>
          <CardDescription>All 8 endpoints wired into src/services/api.ts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-6 py-3">Method & Route</th>
                  <th className="px-4 py-3">AWS Target</th>
                  <th className="px-4 py-3">Authorization</th>
                  <th className="px-6 py-3">Responsibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {[
                  ['GET /health', 'Health Lambda', 'Public', 'Verifies API Gateway + Lambda readiness'],
                  ['GET /events', 'Events Lambda → DynamoDB', 'Public', 'Lists campus events and live capacity counts'],
                  ['POST /events', 'Events Lambda → DynamoDB', 'Cognito Organizer JWT', 'Validates & creates a new campus event'],
                  ['POST /events/{id}/register', 'Register Lambda → DynamoDB', 'Student / Public', 'Conditional write preventing duplicate & full bookings'],
                  ['POST /events/{id}/feedback', 'Feedback Lambda → DynamoDB', 'Attendee', 'Stores 4-dimension scores & written feedback'],
                  ['GET /events/{id}/analytics', 'Analytics Lambda → Bedrock', 'Organizer / Read', 'Computes distributions & invokes Amazon Bedrock'],
                  ['POST /events/{id}/reports', 'Reports Lambda → Step Functions', 'Cognito Organizer JWT', 'Starts automated report state machine'],
                  ['GET /reports/{id}', 'Reports Lambda → DynamoDB + S3', 'Cognito Organizer JWT', 'Returns workflow status & private S3 presigned URL'],
                ].map(([route, target, auth, desc]) => (
                  <tr key={route}>
                    <td className="px-6 py-3 font-mono text-xs font-medium text-slate-900 whitespace-nowrap">
                      {route}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{target}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {auth.includes('Cognito') && (
                          <ShieldCheck className="h-3.5 w-3.5 text-orange-600" />
                        )}
                        {auth}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
