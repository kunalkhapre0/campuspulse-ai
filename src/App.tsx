import { useCallback, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Button } from '@/src/components/ui/button';
import { WorkspaceShell } from '@/src/components/layout/WorkspaceShell';
import { RegistrationModal } from '@/src/components/shared/RegistrationModal';
import { LandingPage } from '@/src/pages/LandingPage';
import { StudentDashboard } from '@/src/pages/StudentDashboard';
import { EventDiscoveryPage } from '@/src/pages/EventDiscoveryPage';
import { EventDetailsPage } from '@/src/pages/EventDetailsPage';
import { OrganizerDashboard } from '@/src/pages/OrganizerDashboard';
import { CreateEventPage } from '@/src/pages/CreateEventPage';
import { AiInsightsPage } from '@/src/pages/AiInsightsPage';
import { ReportsPage } from '@/src/pages/ReportsPage';
import { ArchitecturePage } from '@/src/pages/ArchitecturePage';
import {
  DEMO_STUDENT_PROFILE,
} from '@/src/data/demoData';
import {
  campusApi,
  getDemoFeedbackList,
  getDemoRegistrations,
  getDemoReportsList,
  isLiveBackendConfigured,
} from '@/src/services/api';
import type {
  AppView,
  CampusEvent,
  CreateEventInput,
  EventRegistration,
  EventReport,
  RegisterEventInput,
  StudentFeedback,
  SubmitFeedbackInput,
} from '@/src/types/campus';

const VIEW_TITLES: Record<AppView, string> = {
  landing: 'Home',
  'student-dashboard': 'Student Dashboard',
  events: 'Discover Events',
  'event-details': 'Event Details',
  'organizer-dashboard': 'Organizer Studio',
  'create-event': 'Create Event',
  'ai-insights': 'AI Insights',
  reports: 'Automated Reports',
  architecture: 'AWS Architecture',
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-cloud-computing-bootcamp');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(isLiveBackendConfigured());

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(getDemoRegistrations());
  const [feedbackList, setFeedbackList] = useState<StudentFeedback[]>(getDemoFeedbackList());
  const [reports, setReports] = useState<EventReport[]>(getDemoReportsList());

  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [activeStudentEmail, setActiveStudentEmail] = useState<string>(
    DEMO_STUDENT_PROFILE.studentEmail
  );
  const [registerModalEvent, setRegisterModalEvent] = useState<CampusEvent | null>(null);

  const loadWorkspaceData = useCallback(async () => {
    setLoadingEvents(true);
    setGlobalError(null);
    const live = isLiveBackendConfigured();
    setIsLiveMode(live);
    try {
      const res = await campusApi.getEvents();
      setEvents(res.events);
      if (!live) {
        setRegistrations(getDemoRegistrations());
        setFeedbackList(getDemoFeedbackList());
        setReports(getDemoReportsList());
      } else {
        // In live mode, clear synthetic demo lists so no mock items mix with live DynamoDB data
        setRegistrations((prev) => prev.filter((r) => !r.id.startsWith('reg-100')));
        setFeedbackList((prev) => prev.filter((f) => !f.id.startsWith('fb-20')));
        setReports((prev) => prev.filter((rep) => rep.source === 'aws-step-functions'));
      }
      if (res.events.length > 0 && !res.events.some((e) => e.id === selectedEventId)) {
        setSelectedEventId(res.events[0].id);
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Unable to load events from configured endpoint.'
      );
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    void loadWorkspaceData();
  }, [loadWorkspaceData]);

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('event-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRegisterForEvent = async (eventId: string, payload: RegisterEventInput) => {
    const res = await campusApi.registerForEvent(eventId, payload);
    setEvents((prev) =>
      prev.map((evt) => (evt.id === eventId ? res.event : evt))
    );
    setRegistrations((prev) => [res.registration, ...prev]);
    setActiveStudentEmail(res.registration.studentEmail);
    return res;
  };

  const handleSubmitFeedback = async (eventId: string, payload: SubmitFeedbackInput) => {
    const res = await campusApi.submitFeedback(eventId, payload);
    setFeedbackList((prev) => [res.feedback, ...prev]);
    return res;
  };

  const handleCreateEvent = async (payload: CreateEventInput) => {
    const res = await campusApi.createEvent(payload);
    setEvents((prev) => [res.event, ...prev]);
    return res;
  };

  const handleGenerateReport = async (eventId: string) => {
    const res = await campusApi.generateEventReport(eventId);
    setReports((prev) => [res.report, ...prev]);
    return res;
  };

  const handleRefreshReport = async (reportId: string) => {
    const res = await campusApi.getReport(reportId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? res.report : r))
    );
  };

  const handleTriggerReportFromOrganizer = async (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('reports');
    try {
      await handleGenerateReport(eventId);
    } catch {
      // ReportsPage displays explicit error/status states
    }
  };

  const activeEvent = events.find((e) => e.id === selectedEventId);

  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          events={events}
          isLiveMode={isLiveMode}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
        />
        <RegistrationModal
          event={registerModalEvent}
          open={Boolean(registerModalEvent)}
          onOpenChange={(open) => {
            if (!open) setRegisterModalEvent(null);
          }}
          defaultStudent={{
            ...DEMO_STUDENT_PROFILE,
            studentEmail: activeStudentEmail,
          }}
          onSubmit={handleRegisterForEvent}
        />
      </>
    );
  }

  return (
    <WorkspaceShell
      currentView={currentView}
      pageTitle={VIEW_TITLES[currentView]}
      isLiveMode={isLiveMode}
      onNavigate={handleNavigate}
    >
      {globalError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <span>{globalError}</span>
            <Button variant="outline" size="sm" onClick={() => void loadWorkspaceData()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {currentView === 'student-dashboard' && (
        <StudentDashboard
          events={events}
          registrations={registrations}
          feedbackList={feedbackList}
          activeStudentName={DEMO_STUDENT_PROFILE.studentName}
          activeStudentEmail={activeStudentEmail}
          onChangeStudentEmail={setActiveStudentEmail}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onOpenRegisterModal={setRegisterModalEvent}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {currentView === 'events' && (
        <EventDiscoveryPage
          events={events}
          registrations={registrations}
          activeStudentEmail={activeStudentEmail}
          loading={loadingEvents}
          onSelectEvent={handleSelectEvent}
          onOpenRegisterModal={setRegisterModalEvent}
        />
      )}

      {currentView === 'event-details' && (
        <EventDetailsPage
          event={activeEvent}
          registrations={registrations}
          feedbackList={feedbackList}
          activeStudentName={DEMO_STUDENT_PROFILE.studentName}
          activeStudentEmail={activeStudentEmail}
          onBack={() => handleNavigate('events')}
          onOpenRegisterModal={setRegisterModalEvent}
          onSubmitFeedback={handleSubmitFeedback}
          onNavigateToInsights={(eventId) => {
            setSelectedEventId(eventId);
            handleNavigate('ai-insights');
          }}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'organizer-dashboard' && (
        <OrganizerDashboard
          events={events}
          registrations={registrations}
          feedbackList={feedbackList}
          reports={reports}
          isLiveMode={isLiveMode}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onInspectInsights={(eventId) => {
            setSelectedEventId(eventId);
            handleNavigate('ai-insights');
          }}
          onTriggerReport={(eventId) => void handleTriggerReportFromOrganizer(eventId)}
        />
      )}

      {currentView === 'create-event' && (
        <CreateEventPage
          onCreateEvent={handleCreateEvent}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
        />
      )}

      {currentView === 'ai-insights' && (
        <AiInsightsPage
          events={events}
          selectedEventId={selectedEventId}
          onSelectEventId={setSelectedEventId}
          onOpenEventDetails={handleSelectEvent}
        />
      )}

      {currentView === 'reports' && (
        <ReportsPage
          events={events}
          feedbackList={feedbackList}
          reports={reports}
          isLiveMode={isLiveMode}
          onGenerateReport={handleGenerateReport}
          onRefreshReport={handleRefreshReport}
        />
      )}

      {currentView === 'architecture' && (
        <ArchitecturePage onConnectionChanged={loadWorkspaceData} />
      )}

      <RegistrationModal
        event={registerModalEvent}
        open={Boolean(registerModalEvent)}
        onOpenChange={(open) => {
          if (!open) setRegisterModalEvent(null);
        }}
        defaultStudent={{
          ...DEMO_STUDENT_PROFILE,
          studentEmail: activeStudentEmail,
        }}
        onSubmit={handleRegisterForEvent}
      />
    </WorkspaceShell>
  );
}
