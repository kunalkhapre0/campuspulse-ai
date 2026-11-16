import { ArrowLeft, Calendar, CheckCircle2, Clock, Mail, MapPin, Sparkles, User, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { EventImage } from '@/src/components/shared/EventImage';
import { FeedbackForm } from '@/src/components/shared/FeedbackForm';
import type {
  AppView,
  CampusEvent,
  EventRegistration,
  StudentFeedback,
  SubmitFeedbackInput,
} from '@/src/types/campus';

interface EventDetailsPageProps {
  event: CampusEvent | undefined;
  registrations: EventRegistration[];
  feedbackList: StudentFeedback[];
  activeStudentName: string;
  activeStudentEmail: string;
  onBack: () => void;
  onOpenRegisterModal: (event: CampusEvent) => void;
  onSubmitFeedback: (eventId: string, payload: SubmitFeedbackInput) => Promise<{
    feedback: StudentFeedback;
    mode: 'live' | 'demo';
  }>;
  onNavigateToInsights: (eventId: string) => void;
  onNavigate: (view: AppView) => void;
}

export function EventDetailsPage({
  event,
  registrations,
  feedbackList,
  activeStudentName,
  activeStudentEmail,
  onBack,
  onOpenRegisterModal,
  onSubmitFeedback,
  onNavigateToInsights,
  onNavigate,
}: EventDetailsPageProps) {
  if (!event) {
    return (
      <Card>
        <CardContent className="p-10 text-center">
          <h2 className="font-display text-lg font-semibold text-slate-900">Event not found</h2>
          <p className="mt-1 text-sm text-slate-500">
            The requested campus event could not be located.
          </p>
          <Button variant="outline" className="mt-4" onClick={onBack}>
            Back to Events
          </Button>
        </CardContent>
      </Card>
    );
  }

  const normalizedEmail = activeStudentEmail.trim().toLowerCase();
  const isRegistered = registrations.some(
    (r) => r.eventId === event.id && r.studentEmail.toLowerCase() === normalizedEmail
  );
  const eventFeedback = feedbackList.filter((f) => f.eventId === event.id);
  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);
  const isClosedOrPast = event.status === 'past' || event.status === 'closed';
  const eligibleForFeedback = isRegistered || event.status === 'past';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToInsights(event.id)}
          >
            <Sparkles className="h-4 w-4 text-orange-600" />
            View AI Insights
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('reports')}
          >
            Automated Reports
          </Button>
        </div>
      </div>

      {/* Hero Split */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 min-h-[240px] bg-slate-100">
            <EventImage
              src={event.imageUrl}
              alt={event.title}
              title={event.title}
              category={event.category}
              className="h-full w-full min-h-[240px]"
            />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600">
                <span>{event.category}</span>
                <span aria-hidden="true"> · </span>
                <span className="text-slate-500">
                  {event.status === 'upcoming'
                    ? 'Upcoming Session'
                    : event.status === 'past'
                    ? 'Completed Session'
                    : 'Registration Closed'}
                </span>
              </p>

              <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {event.title}
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                {event.description}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-mono tabular-nums">{event.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-mono tabular-nums">
                    {event.startTime} – {event.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-mono tabular-nums">
                    {event.registeredCount} / {event.capacity} registered ({seatsRemaining} open)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600 space-y-0.5">
                <p className="font-medium text-slate-900 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {event.organizerName} · {event.organizerDepartment}
                </p>
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {event.organizerEmail}
                </p>
              </div>

              {isRegistered ? (
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Registered ({activeStudentEmail})
                </div>
              ) : (
                <Button
                  variant="accent"
                  disabled={isClosedOrPast || seatsRemaining === 0}
                  onClick={() => onOpenRegisterModal(event)}
                >
                  {isClosedOrPast
                    ? 'Registration Closed'
                    : seatsRemaining === 0
                    ? 'Event Full'
                    : 'Register for Event'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Feedback Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Session Schedule</CardTitle>
            <CardDescription>Agenda timeline and confirmed speakers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.schedule.length === 0 ? (
              <p className="text-sm text-slate-500">Schedule agenda will be published soon.</p>
            ) : (
              event.schedule.map((slot, index) => (
                <div
                  key={`${slot.time}-${index}`}
                  className="pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <p className="font-mono text-xs font-medium text-orange-600 tabular-nums">
                    {slot.time}
                  </p>
                  <p className="mt-1 font-medium text-sm text-slate-900">{slot.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">Speaker: {slot.speaker}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Attendee Feedback</CardTitle>
            <CardDescription>
              Structured evaluations routed to Amazon DynamoDB and Amazon Bedrock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {eligibleForFeedback ? (
              <FeedbackForm
                eventId={event.id}
                eventTitle={event.title}
                defaultStudentName={activeStudentName}
                defaultStudentEmail={activeStudentEmail}
                onSubmit={onSubmitFeedback}
              />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Register for this session first to unlock attendee feedback submission.
              </div>
            )}

            {eventFeedback.length > 0 && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="font-display text-sm font-semibold text-slate-900">
                  Recorded Attendee Responses ({eventFeedback.length})
                </h4>
                <div className="space-y-3">
                  {eventFeedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-900">{fb.studentName}</span>
                        <span className="font-mono tabular-nums">
                          Overall {fb.overallRating}/5 · Event {fb.eventQuality}/5 · Speaker{' '}
                          {fb.speakerQuality}/5 · Learning {fb.learningExperience}/5
                        </span>
                      </div>
                      <p className="mt-2 text-slate-700 leading-relaxed">{fb.writtenFeedback}</p>
                      {fb.suggestions && (
                        <p className="mt-1.5 text-xs text-slate-500">
                          Suggestion: {fb.suggestions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
