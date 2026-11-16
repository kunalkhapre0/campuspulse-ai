import { useState, type FormEvent } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Star } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import type { StudentFeedback, SubmitFeedbackInput } from '@/src/types/campus';
import { cn } from '@/src/lib/utils';

interface RatingFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

function RatingField({ label, value, onChange }: RatingFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(score)}
            aria-label={`${label} ${score} out of 5`}
            aria-checked={value === score}
            role="radio"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-mono tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600',
              score <= value
                ? 'border-orange-300 bg-orange-50 text-orange-700 font-semibold'
                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
            )}
          >
            <Star
              className={cn(
                'h-4 w-4',
                score <= value ? 'fill-orange-500 text-orange-500' : 'text-slate-300'
              )}
            />
          </button>
        ))}
        <span className="ml-2 w-8 text-right font-mono text-xs text-slate-600 tabular-nums">
          {value}/5
        </span>
      </div>
    </div>
  );
}

interface FeedbackFormProps {
  eventId: string;
  eventTitle: string;
  defaultStudentName: string;
  defaultStudentEmail: string;
  onSubmit: (eventId: string, payload: SubmitFeedbackInput) => Promise<{
    feedback: StudentFeedback;
    mode: 'live' | 'demo';
  }>;
  onSuccess?: () => void;
}

export function FeedbackForm({
  eventId,
  eventTitle,
  defaultStudentName,
  defaultStudentEmail,
  onSubmit,
  onSuccess,
}: FeedbackFormProps) {
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [studentEmail, setStudentEmail] = useState(defaultStudentEmail);
  const [overallRating, setOverallRating] = useState(5);
  const [eventQuality, setEventQuality] = useState(5);
  const [speakerQuality, setSpeakerQuality] = useState(5);
  const [learningExperience, setLearningExperience] = useState(5);
  const [writtenFeedback, setWrittenFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMode, setSubmittedMode] = useState<'live' | 'demo' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await onSubmit(eventId, {
        studentName,
        studentEmail,
        overallRating,
        eventQuality,
        speakerQuality,
        learningExperience,
        writtenFeedback,
        suggestions,
      });
      setSubmittedMode(res.mode);
      setWrittenFeedback('');
      setSuggestions('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedMode) {
    return (
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
        <AlertDescription>
          <p className="font-semibold text-emerald-950">
            Feedback recorded for {eventTitle}
          </p>
          <p className="mt-1 text-xs text-emerald-900">
            {submittedMode === 'live'
              ? 'Stored in Amazon DynamoDB and queued for Amazon Bedrock analysis.'
              : 'Recorded in local Demo Mode state. View updated averages in AI Insights.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setSubmittedMode(null)}
          >
            Submit Another Response
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="fb-name">Attendee Name</Label>
          <Input
            id="fb-name"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fb-email">Attendee Email</Label>
          <Input
            id="fb-email"
            type="email"
            required
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            placeholder="name@university.edu"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2">
        <RatingField label="Overall Rating" value={overallRating} onChange={setOverallRating} />
        <RatingField label="Event Quality" value={eventQuality} onChange={setEventQuality} />
        <RatingField label="Speaker Quality" value={speakerQuality} onChange={setSpeakerQuality} />
        <RatingField
          label="Learning Experience"
          value={learningExperience}
          onChange={setLearningExperience}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fb-written">Written Feedback</Label>
        <Textarea
          id="fb-written"
          required
          value={writtenFeedback}
          onChange={(e) => setWrittenFeedback(e.target.value)}
          placeholder="What worked well during the session, lab exercises, or Q&A?"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fb-suggestions">Suggestions for Improvement</Label>
        <Textarea
          id="fb-suggestions"
          value={suggestions}
          onChange={(e) => setSuggestions(e.target.value)}
          placeholder="Optional recommendations for pacing, prerequisites, or venue logistics"
          rows={2}
        />
      </div>

      <div className="flex items-center justify-end">
        <Button type="submit" variant="accent" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit Structured Feedback
        </Button>
      </div>
    </form>
  );
}
