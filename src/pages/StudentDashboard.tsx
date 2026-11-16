import { useState } from 'react';
import { Calendar, CheckCircle2, ArrowRight, MessageSquarePlus, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { FeedbackForm } from '@/src/components/shared/FeedbackForm';
import type {
  AppView,
  CampusEvent,
  EventRegistration,
  StudentFeedback,
  SubmitFeedbackInput,
} from '@/src/types/campus';

interface StudentDashboardProps {
  events: CampusEvent[];
  registrations: EventRegistration[];
  feedbackList: StudentFeedback[];
  activeStudentName: string;
  activeStudentEmail: string;
  onChangeStudentEmail: (email: string) => void;
  onNavigate: (view: AppView) => void;
  onSelectEvent: (eventId: string) => void;
  onOpenRegisterModal: (event: CampusEvent) => void;
  onSubmitFeedback: (eventId: string, payload: SubmitFeedbackInput) => Promise<{
    feedback: StudentFeedback;
    mode: 'live' | 'demo';
  }>;
}

export function StudentDashboard({
  events,
  registrations,
  feedbackList,
  activeStudentName,
  activeStudentEmail,
  onChangeStudentEmail,
  onNavigate,
  onSelectEvent,
  onOpenRegisterModal,
  onSubmitFeedback,
}: StudentDashboardProps) {
  const [feedbackModalEvent, setFeedbackModalEvent] = useState<CampusEvent | null>(null);

  const normalizedEmail = activeStudentEmail.trim().toLowerCase();
  const studentRegistrations = registrations.filter(
    (r) => r.studentEmail.toLowerCase() === normalizedEmail
  );
  const registeredEventIds = new Set(studentRegistrations.map((r) => r.eventId));
  const studentFeedback = feedbackList.filter(
    (f) => f.studentEmail.toLowerCase() === normalizedEmail
  );
  const feedbackEventIds = new Set(studentFeedback.map((f) => f.eventId));

  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const pastEvents = events.filter((e) => e.status === 'past');
  const myRegisteredEvents = events.filter((e) => registeredEventIds.has(e.id));

  return (
    <div className="space-y-8">
      {/* Welcome Header & Active Student Email Filter */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-orange-600">Student Portal</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {activeStudentName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Track your campus event registrations, review upcoming workshops, and submit structured
            session feedback.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="student-email-filter" className="text-xs text-slate-500">
              Active Student Email
            </Label>
            <Input
              id="student-email-filter"
              value={activeStudentEmail}
              onChange={(e) => onChangeStudentEmail(e.target.value)}
              className="w-full sm:w-64 h-9 text-sm"
              placeholder="aarav.patel@university.edu"
            />
          </div>
          <Button variant="accent" size="sm" onClick={() => onNavigate('events')}>
            Explore Events
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Student Activity Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Registered Events</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {studentRegistrations.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Upcoming Available</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {upcomingEvents.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Past Events</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {pastEvents.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Feedback Submitted</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
              {studentFeedback.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Registered Events */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Your Registered Events
          </h2>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {myRegisteredEvents.length} total
          </span>
        </div>

        {myRegisteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-display text-base font-semibold text-slate-900">
                No registrations found for {activeStudentEmail}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Discover upcoming campus workshops and hackathons to reserve your seat.
              </p>
              <Button
                variant="accent"
                size="sm"
                className="mt-4"
                onClick={() => onNavigate('events')}
              >
                Browse Campus Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {myRegisteredEvents.map((evt) => {
                const reg = studentRegistrations.find((r) => r.eventId === evt.id);
                const hasSubmittedFeedback = feedbackEventIds.has(evt.id);

                return (
                  <div
                    key={evt.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">
                        <span>{evt.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{evt.date}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{evt.venue}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => onSelectEvent(evt.id)}
                        className="text-left font-display text-base font-semibold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        {evt.title}
                      </button>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {reg?.status === 'attended' ? 'Attended' : 'Registration Confirmed'}
                        </span>
                        {reg && (
                          <span className="font-mono text-slate-400">ID: {reg.id}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectEvent(evt.id)}
                      >
                        Event Details
                      </Button>
                      {hasSubmittedFeedback ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Feedback Submitted
                        </span>
                      ) : (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => setFeedbackModalEvent(evt)}
                        >
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                          Submit Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Upcoming & Past Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Available Upcoming Events</CardTitle>
            <CardDescription>Open campus sessions accepting student registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((evt) => {
              const isReg = registeredEventIds.has(evt.id);
              const seatsLeft = Math.max(0, evt.capacity - evt.registeredCount);
              return (
                <div
                  key={evt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-b-0"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(evt.id)}
                      className="text-left font-medium text-sm text-slate-900 hover:text-orange-600 cursor-pointer"
                    >
                      {evt.title}
                    </button>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono tabular-nums">{evt.date}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{evt.venue}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono tabular-nums">{seatsLeft} seats left</span>
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isReg ? (
                      <span className="text-xs font-medium text-emerald-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Registered
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={seatsLeft === 0}
                        onClick={() => onOpenRegisterModal(evt)}
                      >
                        {seatsLeft === 0 ? 'Full' : 'Register'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Past Campus Events</CardTitle>
            <CardDescription>Completed sessions open for attendee feedback & insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pastEvents.map((evt) => {
              const hasFeedback = feedbackEventIds.has(evt.id);
              return (
                <div
                  key={evt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-100 last:border-b-0"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onSelectEvent(evt.id)}
                      className="text-left font-medium text-sm text-slate-900 hover:text-orange-600 cursor-pointer"
                    >
                      {evt.title}
                    </button>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono tabular-nums">{evt.date}</span>
                      <span aria-hidden="true">·</span>
                      <span>{evt.organizerName}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectEvent(evt.id)}
                    >
                      Details
                    </Button>
                    {!hasFeedback && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFeedbackModalEvent(evt)}
                      >
                        Rate Session
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Modal */}
      <Dialog
        open={Boolean(feedbackModalEvent)}
        onOpenChange={(open) => {
          if (!open) setFeedbackModalEvent(null);
        }}
      >
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session Feedback — {feedbackModalEvent?.title}</DialogTitle>
            <DialogDescription>
              Submit structured ratings and qualitative notes for Amazon Bedrock event analysis.
            </DialogDescription>
          </DialogHeader>
          {feedbackModalEvent && (
            <FeedbackForm
              eventId={feedbackModalEvent.id}
              eventTitle={feedbackModalEvent.title}
              defaultStudentName={activeStudentName}
              defaultStudentEmail={activeStudentEmail}
              onSubmit={onSubmitFeedback}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
