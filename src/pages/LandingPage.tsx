import { ArrowRight, CheckCircle2, FileText, Layers, ShieldCheck, Sparkles, Workflow } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { EventImage } from '@/src/components/shared/EventImage';
import { HERO_IMAGE_PATH } from '@/src/data/demoData';
import type { AppView, CampusEvent } from '@/src/types/campus';

interface LandingPageProps {
  events: CampusEvent[];
  isLiveMode: boolean;
  onNavigate: (view: AppView) => void;
  onSelectEvent: (eventId: string) => void;
}

export function LandingPage({
  events,
  isLiveMode,
  onNavigate,
  onSelectEvent,
}: LandingPageProps) {
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
          >
            CampusPulse AI
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a
              href="#platform"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Platform
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Workflow
            </a>
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => onNavigate('architecture')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Architecture
            </button>
          </nav>

          <div className="shrink-0">
            <Button
              variant="accent"
              size="sm"
              onClick={() => onNavigate('student-dashboard')}
            >
              Open Console
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-slate-950 text-white border-b border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-xs font-medium tracking-wide text-orange-400">
                  AWS Builder Center Weekend Challenge · Serverless Campus Intelligence
                </p>
                <h1
                  className="mt-4 font-display font-bold tracking-tight text-white text-balance"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', lineHeight: 1.08 }}
                >
                  Turn Campus Events Into Actionable Insights
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                  CampusPulse AI unifies university event discovery, duplicate-safe student
                  registrations, Amazon Bedrock feedback synthesis, and automated AWS Step
                  Functions reporting into private Amazon S3 storage.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => onNavigate('student-dashboard')}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                    onClick={() => onNavigate('events')}
                  >
                    Explore Events
                  </Button>
                </div>

                <p className="mt-6 text-xs text-slate-400">
                  {isLiveMode
                    ? 'Connected to configured AWS API Gateway endpoint.'
                    : 'Running in labeled Demo Mode with synthetic university data until VITE_API_BASE_URL is configured.'}
                </p>
              </div>

              <div className="lg:col-span-6">
                <div className="h-full min-h-[300px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                  <EventImage
                    src={HERO_IMAGE_PATH}
                    alt="University students attending a campus cloud technology keynote in a modern tiered auditorium"
                    title="CampusPulse AI Innovation Summit"
                    category="Serverless Event Operations"
                    className="h-full w-full min-h-[300px] lg:min-h-[420px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full-Width 4-Column Capability Strip Below Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <div>
                <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">6</p>
                <p className="mt-1 text-sm font-medium text-slate-900">AWS Serverless Services</p>
                <p className="mt-1 text-xs text-slate-500">
                  API Gateway, Lambda, DynamoDB, S3, Step Functions, and Bedrock
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">4 Metrics</p>
                <p className="mt-1 text-sm font-medium text-slate-900">Structured Feedback</p>
                <p className="mt-1 text-xs text-slate-500">
                  Overall, event quality, speaker delivery, and learning depth
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">Private S3</p>
                <p className="mt-1 text-sm font-medium text-slate-900">Presigned Report Delivery</p>
                <p className="mt-1 text-xs text-slate-500">
                  Reports stay in blocked-public-access buckets with time-limited URLs
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-semibold text-slate-900 tabular-nums">Zero Idle</p>
                <p className="mt-1 text-sm font-medium text-slate-900">Pay-Per-Execution</p>
                <p className="mt-1 text-xs text-slate-500">
                  Scales automatically across university registration spikes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview (Asymmetric Bento Grid) */}
        <section id="platform" className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-wide text-orange-600">
              Platform Capabilities
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Built for university organizers and student builders
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every stage of the campus event lifecycle runs through stateless AWS Lambda handlers
              and DynamoDB atomic counters, eliminating manual spreadsheets and post-event guesswork.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-orange-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-slate-900">
                  Amazon Bedrock Feedback Intelligence
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Move beyond raw five-star averages. Lambda aggregates verified attendee responses
                  and invokes Amazon Bedrock to extract recurring themes, repeated friction points,
                  sentiment distributions, and concrete organizer recommendations—while strictly
                  distinguishing live Bedrock outputs from unavailable or demo states.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  Endpoint: <span className="font-mono text-slate-800">GET /events/{'{id}'}/analytics</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => onNavigate('ai-insights')}>
                  Inspect AI Insights
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-slate-900">
                  Atomic Capacity & Duplicate Protection
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  DynamoDB conditional writes prevent duplicate student registrations and guarantee
                  seat capacities are never oversubscribed during high-demand workshop launches.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-mono">
                  POST /events/{'{id}'}/register
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                  <Workflow className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-slate-900">
                  Step Functions Report Orchestration
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Organizers trigger multi-step post-event synthesis workflows that fetch feedback,
                  invoke Bedrock, compile structured executive reports, and persist metadata.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => onNavigate('reports')}>
                  View Automated Reports
                </Button>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-7 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-slate-900">
                  Private Amazon S3 Artifacts with Presigned Downloads
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                  Generated reports are never exposed in public buckets. Lambda generates short-lived
                  S3 presigned URLs on demand via <span className="font-mono text-slate-800">GET /reports/{'{id}'}</span> so
                  authorized faculty and student leads can securely download deliverables.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-slate-500">
                  BlockPublicAcls · IgnorePublicAcls · SSE-S3 Encryption
                </span>
                <Button variant="outline" size="sm" onClick={() => onNavigate('organizer-dashboard')}>
                  Open Organizer Studio
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-wide text-orange-600">
                Serverless Execution Flow
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                How CampusPulse AI operates end to end
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01. Publish & Register',
                  detail:
                    'Organizers create campus sessions via API Gateway and Lambda; students browse open seats and register with duplicate checks.',
                },
                {
                  step: '02. Structured Feedback',
                  detail:
                    'Eligible attendees submit four-dimension quality ratings alongside qualitative feedback and improvement suggestions.',
                },
                {
                  step: '03. Bedrock Synthesis',
                  detail:
                    'Analytics Lambda aggregates responses and invokes Amazon Bedrock to identify recurring themes and actionable priorities.',
                },
                {
                  step: '04. S3 Report Delivery',
                  detail:
                    'AWS Step Functions compiles the executive report, stores it in a private S3 bucket, and returns a presigned download link.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-6"
                >
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    {item.step}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events Preview */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wide text-orange-600">
                Campus Schedule
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                Upcoming & recent campus sessions
              </h2>
            </div>
            <Button variant="outline" onClick={() => onNavigate('events')}>
              Browse All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => {
              const seatsLeft = Math.max(0, evt.capacity - evt.registeredCount);
              return (
                <article
                  key={evt.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <EventImage
                      src={evt.imageUrl}
                      alt={evt.title}
                      title={evt.title}
                      category={evt.category}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        <span>{evt.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{evt.date}</span>
                      </p>
                      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">
                        {evt.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-xs font-mono text-slate-600 tabular-nums">
                        {seatsLeft} seats left
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectEvent(evt.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* AWS Architecture Overview Callout */}
        <section className="bg-slate-950 text-white border-t border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold tracking-wide text-orange-400">
                  Cloud Architecture
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white text-balance">
                  Zero-server architecture engineered for real university workloads
                </h2>
                <p className="mt-3 text-base text-slate-300 leading-relaxed max-w-2xl">
                  Explore the exact AWS SAM template, Step Functions ASL state machine, DynamoDB
                  table design, and live API Gateway health inspector built for the AWS Builder
                  Center Weekend Challenge.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
                  {[
                    'Amazon API Gateway HTTP API',
                    'AWS Lambda (Node.js 20 ESM)',
                    'Amazon DynamoDB Conditional Writes',
                    'Amazon Bedrock Text & Theme Analysis',
                    'AWS Step Functions Workflow Engine',
                    'Private Amazon S3 + Presigned URLs',
                  ].map((service) => (
                    <div key={service} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex lg:justify-end">
                <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-7">
                  <div className="flex items-center gap-3 text-orange-400">
                    <Layers className="h-5 w-5" />
                    <span className="font-display text-base font-semibold text-white">
                      Inspect Architecture & Live Health
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    Review the competition presentation, inspect exact endpoint contracts, or connect
                    your deployed AWS API Gateway URL to switch out of Demo Mode.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      variant="accent"
                      onClick={() => onNavigate('architecture')}
                    >
                      Open Architecture View
                    </Button>
                    <Button
                      variant="outline"
                      className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white"
                      onClick={() => onNavigate('organizer-dashboard')}
                    >
                      Organizer Console
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-display font-semibold text-slate-900">CampusPulse AI</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>AWS Builder Center Weekend Challenge: No Pipeline, No Problem</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => onNavigate('events')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Events
            </button>
            <button
              type="button"
              onClick={() => onNavigate('ai-insights')}
              className="hover:text-slate-900 cursor-pointer"
            >
              AI Insights
            </button>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Reports
            </button>
            <button
              type="button"
              onClick={() => onNavigate('architecture')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Architecture
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
