import {
  computeDemoAnalytics,
  DEMO_EVENTS,
  DEMO_FEEDBACK,
  DEMO_REGISTRATIONS,
  DEMO_REPORTS,
} from '@/src/data/demoData';
import type {
  BedrockAnalyticsResult,
  CampusEvent,
  CreateEventInput,
  EventRegistration,
  EventReport,
  HealthCheckResponse,
  RegisterEventInput,
  StudentFeedback,
  SubmitFeedbackInput,
} from '@/src/types/campus';

const DEFAULT_TIMEOUT_MS = 12000;

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Runtime session-only override (intentionally NOT stored in localStorage to avoid persisting config/tokens)
let runtimeEndpointOverride = '';

export function getConfiguredApiBaseUrl(): string {
  const override = runtimeEndpointOverride.trim().replace(/\/+$/, '');
  if (override) return override;
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
  return envUrl.trim().replace(/\/+$/, '');
}

export function setRuntimeApiBaseUrl(url: string): void {
  runtimeEndpointOverride = url.trim().replace(/\/+$/, '');
}

export function isLiveBackendConfigured(): boolean {
  return Boolean(getConfiguredApiBaseUrl());
}

// In-memory Demo Mode store (only active when VITE_API_BASE_URL is not configured)
class DemoStateStore {
  events: CampusEvent[] = structuredClone(DEMO_EVENTS);
  registrations: EventRegistration[] = structuredClone(DEMO_REGISTRATIONS);
  feedback: StudentFeedback[] = structuredClone(DEMO_FEEDBACK);
  reports: EventReport[] = structuredClone(DEMO_REPORTS);

  reset() {
    this.events = structuredClone(DEMO_EVENTS);
    this.registrations = structuredClone(DEMO_REGISTRATIONS);
    this.feedback = structuredClone(DEMO_FEEDBACK);
    this.reports = structuredClone(DEMO_REPORTS);
  }
}

const demoStore = new DemoStateStore();

export function resetDemoState(): void {
  demoStore.reset();
}

export function getDemoRegistrations(): EventRegistration[] {
  return [...demoStore.registrations];
}

export function getDemoFeedbackList(): StudentFeedback[] {
  return [...demoStore.feedback];
}

export function getDemoReportsList(): EventReport[] {
  return [...demoStore.reports];
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<{ data: T; latencyMs: number }> {
  const baseUrl = getConfiguredApiBaseUrl();
  if (!baseUrl) {
    throw new ApiError('AWS API Gateway URL is not configured.', 0, 'NO_BACKEND_CONFIGURED');
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const latencyMs = Math.round(performance.now() - started);
    const text = await response.text();
    let parsed: Record<string, unknown> = {};
    if (text) {
      try {
        parsed = JSON.parse(text) as Record<string, unknown>;
      } catch {
        parsed = { message: text };
      }
    }

    if (!response.ok) {
      const serverMessage =
        (typeof parsed.error === 'string' && parsed.error) ||
        (typeof parsed.message === 'string' && parsed.message) ||
        `Request failed with HTTP ${response.status}`;

      if (response.status === 409) {
        throw new ApiError(serverMessage, 409, 'DUPLICATE_OR_CONFLICT');
      }
      if (response.status === 404) {
        throw new ApiError(serverMessage, 404, 'NOT_FOUND');
      }
      if (response.status === 400 || response.status === 422) {
        throw new ApiError(serverMessage, response.status, 'VALIDATION_ERROR');
      }
      throw new ApiError(serverMessage, response.status, 'SERVER_ERROR');
    }

    return { data: parsed as unknown as T, latencyMs };
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(
        `Request timed out after ${Math.round(timeoutMs / 1000)}s while contacting AWS API Gateway.`,
        408,
        'TIMEOUT'
      );
    }
    throw new ApiError(
      'Network error contacting AWS API Gateway. Verify endpoint URL, CORS headers, and internet connectivity.',
      0,
      'NETWORK_ERROR'
    );
  } finally {
    window.clearTimeout(timer);
  }
}

export const campusApi = {
  /**
   * GET /health
   */
  async getHealth(): Promise<HealthCheckResponse> {
    const baseUrl = getConfiguredApiBaseUrl();
    if (!baseUrl) {
      return {
        ok: true,
        mode: 'demo',
        endpoint: 'Not configured (Demo Mode active)',
        service: 'CampusPulse Demo Store',
        region: (import.meta.env.VITE_AWS_REGION as string) || 'us-east-1',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const { data, latencyMs } = await requestJson<{
        status?: string;
        service?: string;
        region?: string;
        timestamp?: string;
      }>('/health', { method: 'GET' }, 8000);

      return {
        ok: true,
        mode: 'live',
        endpoint: baseUrl,
        latencyMs,
        service: data.service || 'AWS API Gateway + Lambda',
        region: data.region || (import.meta.env.VITE_AWS_REGION as string) || 'us-east-1',
        timestamp: data.timestamp || new Date().toISOString(),
      };
    } catch (err) {
      return {
        ok: false,
        mode: 'live',
        endpoint: baseUrl,
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Health check failed',
      };
    }
  },

  /**
   * GET /events
   */
  async getEvents(): Promise<{ events: CampusEvent[]; mode: 'live' | 'demo' }> {
    if (!isLiveBackendConfigured()) {
      return { events: [...demoStore.events], mode: 'demo' };
    }
    const { data } = await requestJson<{ events?: CampusEvent[] } | CampusEvent[]>('/events', {
      method: 'GET',
    });
    const events = Array.isArray(data) ? data : data.events || [];
    return { events, mode: 'live' };
  },

  /**
   * POST /events
   */
  async createEvent(
    payload: CreateEventInput
  ): Promise<{ event: CampusEvent; mode: 'live' | 'demo' }> {
    if (!payload.title.trim() || !payload.venue.trim() || !payload.date) {
      throw new ApiError('Event title, date, and venue are required.', 400, 'VALIDATION_ERROR');
    }
    if (payload.capacity < 1 || payload.capacity > 10000) {
      throw new ApiError('Capacity must be between 1 and 10,000 seats.', 400, 'VALIDATION_ERROR');
    }

    if (!isLiveBackendConfigured()) {
      const newEvent: CampusEvent = {
        ...payload,
        id: `evt-${Date.now().toString(36)}`,
        registeredCount: 0,
        checkedInCount: 0,
        status: new Date(payload.date) < new Date(new Date().toDateString()) ? 'past' : 'upcoming',
        imageUrl: '/src/assets/images/event_cloud_workshop_1794829626254.jpg',
        createdAt: new Date().toISOString(),
      };
      demoStore.events = [newEvent, ...demoStore.events];
      return { event: newEvent, mode: 'demo' };
    }

    const { data } = await requestJson<{ event?: CampusEvent } | CampusEvent>('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const event = 'event' in data && data.event ? data.event : (data as CampusEvent);
    return { event, mode: 'live' };
  },

  /**
   * POST /events/{id}/register
   */
  async registerForEvent(
    eventId: string,
    payload: RegisterEventInput
  ): Promise<{ registration: EventRegistration; event: CampusEvent; mode: 'live' | 'demo' }> {
    if (!payload.studentName.trim() || !payload.studentEmail.trim() || !payload.studentId.trim()) {
      throw new ApiError(
        'Full name, university email, and student ID are required.',
        400,
        'VALIDATION_ERROR'
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.studentEmail.trim())) {
      throw new ApiError('Please enter a valid university email address.', 400, 'VALIDATION_ERROR');
    }

    if (!isLiveBackendConfigured()) {
      const event = demoStore.events.find((e) => e.id === eventId);
      if (!event) {
        throw new ApiError('Event not found.', 404, 'NOT_FOUND');
      }
      if (event.status === 'closed') {
        throw new ApiError('Registration for this event is closed.', 409, 'EVENT_CLOSED');
      }
      if (event.registeredCount >= event.capacity) {
        throw new ApiError('This event has reached full capacity.', 409, 'EVENT_FULL');
      }
      const normalizedEmail = payload.studentEmail.trim().toLowerCase();
      const duplicate = demoStore.registrations.find(
        (r) => r.eventId === eventId && r.studentEmail.toLowerCase() === normalizedEmail
      );
      if (duplicate) {
        throw new ApiError(
          'This email is already registered for this event (duplicate registration prevented).',
          409,
          'DUPLICATE_REGISTRATION'
        );
      }

      const registration: EventRegistration = {
        id: `reg-${Date.now().toString(36)}`,
        eventId,
        studentName: payload.studentName.trim(),
        studentEmail: normalizedEmail,
        studentId: payload.studentId.trim(),
        department: payload.department.trim() || 'General Studies',
        status: 'confirmed',
        registeredAt: new Date().toISOString(),
      };
      demoStore.registrations = [registration, ...demoStore.registrations];
      event.registeredCount += 1;
      return { registration, event: { ...event }, mode: 'demo' };
    }

    const { data } = await requestJson<{
      registration: EventRegistration;
      event: CampusEvent;
    }>(`/events/${encodeURIComponent(eventId)}/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ...data, mode: 'live' };
  },

  /**
   * POST /events/{id}/feedback
   */
  async submitFeedback(
    eventId: string,
    payload: SubmitFeedbackInput
  ): Promise<{ feedback: StudentFeedback; mode: 'live' | 'demo' }> {
    const scores = [
      payload.overallRating,
      payload.eventQuality,
      payload.speakerQuality,
      payload.learningExperience,
    ];
    if (scores.some((s) => s < 1 || s > 5)) {
      throw new ApiError('All rating dimensions must be between 1 and 5.', 400, 'VALIDATION_ERROR');
    }
    if (payload.writtenFeedback.trim().length < 10) {
      throw new ApiError(
        'Please write at least 10 characters of feedback so insights remain meaningful.',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!isLiveBackendConfigured()) {
      const event = demoStore.events.find((e) => e.id === eventId);
      if (!event) {
        throw new ApiError('Event not found.', 404, 'NOT_FOUND');
      }
      const normalizedEmail = payload.studentEmail.trim().toLowerCase();
      const duplicate = demoStore.feedback.find(
        (f) => f.eventId === eventId && f.studentEmail.toLowerCase() === normalizedEmail
      );
      if (duplicate) {
        throw new ApiError(
          'Feedback has already been recorded for this attendee email.',
          409,
          'DUPLICATE_FEEDBACK'
        );
      }

      const item: StudentFeedback = {
        id: `fb-${Date.now().toString(36)}`,
        eventId,
        studentName: payload.studentName.trim() || 'Campus Attendee',
        studentEmail: normalizedEmail,
        overallRating: payload.overallRating,
        eventQuality: payload.eventQuality,
        speakerQuality: payload.speakerQuality,
        learningExperience: payload.learningExperience,
        writtenFeedback: payload.writtenFeedback.trim(),
        suggestions: payload.suggestions.trim(),
        submittedAt: new Date().toISOString(),
      };
      demoStore.feedback = [item, ...demoStore.feedback];
      return { feedback: item, mode: 'demo' };
    }

    const { data } = await requestJson<{ feedback: StudentFeedback }>(
      `/events/${encodeURIComponent(eventId)}/feedback`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return { feedback: data.feedback, mode: 'live' };
  },

  /**
   * GET /events/{id}/analytics
   */
  async getEventAnalytics(eventId: string): Promise<BedrockAnalyticsResult> {
    if (!isLiveBackendConfigured()) {
      const event = demoStore.events.find((e) => e.id === eventId);
      if (!event) {
        throw new ApiError('Event not found.', 404, 'NOT_FOUND');
      }
      return computeDemoAnalytics(eventId, demoStore.feedback);
    }

    const { data } = await requestJson<BedrockAnalyticsResult>(
      `/events/${encodeURIComponent(eventId)}/analytics`,
      { method: 'GET' },
      20000
    );
    return data;
  },

  /**
   * POST /events/{id}/reports
   */
  async generateEventReport(
    eventId: string
  ): Promise<{ report: EventReport; mode: 'live' | 'demo' }> {
    if (!isLiveBackendConfigured()) {
      const event = demoStore.events.find((e) => e.id === eventId);
      if (!event) {
        throw new ApiError('Event not found.', 404, 'NOT_FOUND');
      }

      const analytics = computeDemoAnalytics(eventId, demoStore.feedback);
      if (analytics.responseCount === 0) {
        throw new ApiError(
          'Cannot generate report: this event has zero feedback responses to analyze.',
          400,
          'INSUFFICIENT_DATA'
        );
      }

      const newReport: EventReport = {
        id: `rep-${Date.now().toString(36)}`,
        eventId: event.id,
        eventName: event.title,
        status: 'SUCCEEDED',
        source: 'demo',
        executionArn: 'DEMO-PREVIEW-ONLY (Live Step Functions execution requires AWS backend)',
        generatedAt: new Date().toISOString(),
        aiSummary: analytics.executiveSummary,
        feedbackAnalysis: `Analyzed ${analytics.responseCount} feedback submissions (${analytics.sentimentCounts.positive} positive, ${analytics.sentimentCounts.neutral} neutral, ${analytics.sentimentCounts.negative} negative; avg ${analytics.averageOverall}/5).`,
        keyRecommendations: analytics.recommendations,
        s3Key: `demo-preview/reports/${event.id}/${Date.now()}.json`,
      };
      demoStore.reports = [newReport, ...demoStore.reports];
      return { report: newReport, mode: 'demo' };
    }

    const { data } = await requestJson<{ report: EventReport }>(
      `/events/${encodeURIComponent(eventId)}/reports`,
      {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      },
      20000
    );
    return { report: data.report, mode: 'live' };
  },

  /**
   * GET /reports/{id}
   */
  async getReport(reportId: string): Promise<{ report: EventReport; mode: 'live' | 'demo' }> {
    if (!isLiveBackendConfigured()) {
      const report = demoStore.reports.find((r) => r.id === reportId);
      if (!report) {
        throw new ApiError('Report not found.', 404, 'NOT_FOUND');
      }
      return { report: { ...report }, mode: 'demo' };
    }

    const { data } = await requestJson<{ report: EventReport }>(
      `/reports/${encodeURIComponent(reportId)}`,
      { method: 'GET' }
    );
    return { report: data.report, mode: 'live' };
  },
};
