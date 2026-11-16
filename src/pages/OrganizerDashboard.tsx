import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, FileText, Sparkles, ShieldAlert, ExternalLink } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import type {
  AppView,
  CampusEvent,
  EventRegistration,
  EventReport,
  StudentFeedback,
} from '@/src/types/campus';

interface OrganizerDashboardProps {
  events: CampusEvent[];
  registrations: EventRegistration[];
  feedbackList: StudentFeedback[];
  reports: EventReport[];
  isLiveMode: boolean;
  onNavigate: (view: AppView) => void;
  onSelectEvent: (eventId: string) => void;
  onInspectInsights: (eventId: string) => void;
  onTriggerReport: (eventId: string) => void;
}

export function OrganizerDashboard({
  events,
  registrations,
  feedbackList,
  reports,
  isLiveMode,
  onNavigate,
  onSelectEvent,
  onInspectInsights,
  onTriggerReport,
}: OrganizerDashboardProps) {
  const stats = useMemo(() => {
    const totalRegistrations = events.reduce((sum, e) => sum + e.registeredCount, 0);
    const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
    const pastEvents = events.filter((e) => e.status === 'past');
    const pastRegistered = pastEvents.reduce((sum, e) => sum + e.registeredCount, 0);
    const pastCheckedIn = pastEvents.reduce((sum, e) => sum + e.checkedInCount, 0);
    const attendanceRate =
      pastRegistered > 0 ? Math.round((pastCheckedIn / pastRegistered) * 100) : 0;

    const avgRating =
      feedbackList.length > 0
        ? (
            feedbackList.reduce((sum, f) => sum + f.overallRating, 0) / feedbackList.length
          ).toFixed(2)
        : '—';

    return {
      totalEvents: events.length,
      totalRegistrations,
      totalCapacity,
      attendanceRate,
      pastCheckedIn,
      pastRegistered,
      avgRating,
    };
  }, [events, feedbackList]);

  const chartData = useMemo(
    () =>
      events.map((e) => ({
        name: e.title.length > 18 ? `${e.title.slice(0, 18)}…` : e.title,
        Registered: e.registeredCount,
        Capacity: e.capacity,
      })),
    [events]
  );

  const recentActivity = useMemo(() => {
    const regItems = registrations.slice(0, 4).map((r) => {
      const evt = events.find((e) => e.id === r.eventId);
      return {
        id: r.id,
        type: 'Registration',
        label: `${r.studentName} registered for ${evt?.title || r.eventId}`,
        timestamp: r.registeredAt,
      };
    });
    const fbItems = feedbackList.slice(0, 4).map((f) => {
      const evt = events.find((e) => e.id === f.eventId);
      return {
        id: f.id,
        type: 'Feedback',
        label: `${f.studentName} rated ${evt?.title || f.eventId} (${f.overallRating}/5)`,
        timestamp: f.submittedAt,
      };
    });
    const repItems = reports.slice(0, 3).map((rep) => ({
      id: rep.id,
      type: 'Report',
      label: `${rep.eventName} report (${rep.status})`,
      timestamp: rep.generatedAt,
    }));

    return [...regItems, ...fbItems, ...repItems]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 6);
  }, [registrations, feedbackList, reports, events]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-orange-600">Organizer Studio</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Campus Event Operations
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Monitor registration capacity, post-event attendance, Bedrock feedback trends, and S3
            report executions.
          </p>
        </div>

        <Button variant="accent" onClick={() => onNavigate('create-event')}>
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Cognito Authorization Notice */}
      <Alert variant="info">
        <ShieldAlert className="h-4 w-4 shrink-0 text-slate-700 mt-0.5" />
        <AlertDescription className="text-xs sm:text-sm">
          <span className="font-semibold text-slate-900">Organizer Access Control: </span>
          {isLiveMode
            ? 'Organizer write routes (POST /events, POST /events/{id}/reports) are protected by Amazon Cognito JWT authorizers in API Gateway.'
            : 'Running in open Demo Mode preview. Production deployments enforce Amazon Cognito JWT authorization on organizer endpoints rather than frontend passwords.'}
        </AlertDescription>
      </Alert>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Total Events</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {stats.totalEvents}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {events.filter((e) => e.status === 'upcoming').length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Total Registrations</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {stats.totalRegistrations}
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              of {stats.totalCapacity} total seats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Past Attendance Rate</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {stats.attendanceRate}%
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {stats.pastCheckedIn}/{stats.pastRegistered} checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Average Feedback Rating</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {stats.avgRating} / 5
            </p>
            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              {feedbackList.length} responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Registration Volume vs. Capacity</CardTitle>
            <CardDescription>Seat utilization across scheduled and completed events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Registered" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest registrations, feedback, and report runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {recentActivity.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-medium text-orange-600">{item.type}</span>
                    <span className="font-mono tabular-nums">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-800">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manage Events Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Manage Campus Events</CardTitle>
            <CardDescription>
              Inspect event rosters, invoke Amazon Bedrock analysis, or start Step Functions report
              workflows
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('create-event')}>
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-4 py-3">Date & Venue</th>
                  <th className="px-4 py-3 text-right">Registered</th>
                  <th className="px-4 py-3 text-right">Feedback</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const fbCount = feedbackList.filter((f) => f.eventId === evt.id).length;
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-slate-900">{evt.title}</p>
                        <p className="text-xs text-slate-500">
                          {evt.category} · {evt.organizerName}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <p className="font-mono tabular-nums">{evt.date}</p>
                        <p className="text-slate-500 truncate max-w-[210px]">{evt.venue}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-900 tabular-nums">
                        {evt.registeredCount} / {evt.capacity}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-900 tabular-nums">
                        {fbCount}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectEvent(evt.id)}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onInspectInsights(evt.id)}
                          >
                            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                            Insights
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={fbCount === 0}
                            onClick={() => onTriggerReport(evt.id)}
                            title={
                              fbCount === 0
                                ? 'Requires at least 1 feedback submission'
                                : 'Generate Automated Report'
                            }
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Report
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
