import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { EVENT_CATEGORIES } from '@/src/data/demoData';
import type {
  AppView,
  CampusEvent,
  CreateEventInput,
  EventCategory,
  ScheduleSlot,
} from '@/src/types/campus';

interface CreateEventPageProps {
  onCreateEvent: (payload: CreateEventInput) => Promise<{
    event: CampusEvent;
    mode: 'live' | 'demo';
  }>;
  onNavigate: (view: AppView) => void;
  onSelectEvent: (eventId: string) => void;
}

export function CreateEventPage({
  onCreateEvent,
  onNavigate,
  onSelectEvent,
}: CreateEventPageProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Cloud & Serverless');
  const [date, setDate] = useState('2026-12-20');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:30');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerDepartment, setOrganizerDepartment] = useState('');
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([
    { time: '14:00 - 15:00', title: 'Technical Session', speaker: 'Lead Speaker' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    event: CampusEvent;
    mode: 'live' | 'demo';
  } | null>(null);

  const addScheduleSlot = () => {
    setSchedule((prev) => [...prev, { time: '', title: '', speaker: '' }]);
  };

  const removeScheduleSlot = (index: number) => {
    setSchedule((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateScheduleSlot = (index: number, field: keyof ScheduleSlot, value: string) => {
    setSchedule((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, [field]: value } : slot))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    const parsedCapacity = Number(capacity);
    if (!Number.isFinite(parsedCapacity) || parsedCapacity < 1) {
      setError('Registration capacity must be a positive number.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail.trim())) {
      setError('Please enter a valid organizer email address.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanedSchedule = schedule.filter((s) => s.title.trim() && s.time.trim());
      const res = await onCreateEvent({
        title: title.trim(),
        description: description.trim(),
        category,
        date,
        startTime,
        endTime,
        venue: venue.trim(),
        capacity: parsedCapacity,
        organizerName: organizerName.trim(),
        organizerEmail: organizerEmail.trim(),
        organizerDepartment: organizerDepartment.trim() || 'Campus Innovation',
        schedule: cleanedSchedule,
      });
      setCreatedResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdResult) {
    return (
      <div className="max-w-2xl space-y-6">
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
          <AlertDescription>
            <p className="font-semibold text-emerald-950">
              Event published: {createdResult.event.title}
            </p>
            <p className="mt-1 text-xs text-emerald-900">
              Event ID: <span className="font-mono">{createdResult.event.id}</span>
              {' · '}
              {createdResult.mode === 'live'
                ? 'Persisted to Amazon DynamoDB via POST /events'
                : 'Added to local Demo Mode state'}
            </p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="accent"
            onClick={() => onSelectEvent(createdResult.event.id)}
          >
            Open Event Details
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCreatedResult(null);
              setTitle('');
              setDescription('');
              setVenue('');
            }}
          >
            Create Another Event
          </Button>
          <Button variant="ghost" onClick={() => onNavigate('organizer-dashboard')}>
            Return to Organizer Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs font-medium text-orange-600">Event Publishing</p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create Campus Event
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Publish a new workshop, hackathon, or meetup to API Gateway (<span className="font-mono text-xs">POST /events</span>).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Specification</CardTitle>
          <CardDescription>
            All fields are validated before submission to Lambda and DynamoDB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="evt-title">Event Title</Label>
              <Input
                id="evt-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Serverless Architecture Lab with AWS Lambda"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="evt-desc">Description</Label>
              <Textarea
                id="evt-desc"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe technical topics, target audience, and expected learning outcomes..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as EventCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="evt-capacity">Registration Capacity</Label>
                <Input
                  id="evt-capacity"
                  type="number"
                  min={1}
                  max={10000}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="evt-date">Date</Label>
                <Input
                  id="evt-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="evt-start">Start Time</Label>
                <Input
                  id="evt-start"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="evt-end">End Time</Label>
                <Input
                  id="evt-end"
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="evt-venue">Campus Venue</Label>
              <Input
                id="evt-venue"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Engineering Innovation Hall, Auditorium A"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <Label htmlFor="org-name">Organizer Name</Label>
                <Input
                  id="org-name"
                  required
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  placeholder="Dr. Elena Rostova"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-email">Organizer Email</Label>
                <Input
                  id="org-email"
                  type="email"
                  required
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  placeholder="organizer@university.edu"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org-dept">Department / Club</Label>
                <Input
                  id="org-dept"
                  required
                  value={organizerDepartment}
                  onChange={(e) => setOrganizerDepartment(e.target.value)}
                  placeholder="School of Computing"
                />
              </div>
            </div>

            {/* Agenda Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <Label>Session Schedule (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addScheduleSlot}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Slot
                </Button>
              </div>
              <div className="space-y-2.5">
                {schedule.map((slot, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <Input
                      className="sm:col-span-3 font-mono text-xs"
                      placeholder="14:00 - 15:00"
                      value={slot.time}
                      onChange={(e) => updateScheduleSlot(index, 'time', e.target.value)}
                    />
                    <Input
                      className="sm:col-span-5 text-sm"
                      placeholder="Session topic"
                      value={slot.title}
                      onChange={(e) => updateScheduleSlot(index, 'title', e.target.value)}
                    />
                    <Input
                      className="sm:col-span-3 text-sm"
                      placeholder="Speaker"
                      value={slot.speaker}
                      onChange={(e) => updateScheduleSlot(index, 'speaker', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="sm:col-span-1 text-slate-400 hover:text-red-600"
                      onClick={() => removeScheduleSlot(index)}
                      aria-label="Remove schedule slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('organizer-dashboard')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
