import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import type { CampusEvent, EventRegistration, RegisterEventInput } from '@/src/types/campus';

interface RegistrationModalProps {
  event: CampusEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStudent: RegisterEventInput;
  onSubmit: (eventId: string, payload: RegisterEventInput) => Promise<{
    registration: EventRegistration;
    event: CampusEvent;
    mode: 'live' | 'demo';
  }>;
}

export function RegistrationModal({
  event,
  open,
  onOpenChange,
  defaultStudent,
  onSubmit,
}: RegistrationModalProps) {
  const [studentName, setStudentName] = useState(defaultStudent.studentName);
  const [studentEmail, setStudentEmail] = useState(defaultStudent.studentEmail);
  const [studentId, setStudentId] = useState(defaultStudent.studentId);
  const [department, setDepartment] = useState(defaultStudent.department);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    registrationId: string;
    mode: 'live' | 'demo';
  } | null>(null);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setError(null);
      setSuccessInfo(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await onSubmit(event.id, {
        studentName,
        studentEmail,
        studentId,
        department,
      });
      setSuccessInfo({
        registrationId: result.registration.id,
        mode: result.mode,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!event) return null;

  const seatsRemaining = Math.max(0, event.capacity - event.registeredCount);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            {event.date} · {event.startTime}–{event.endTime} · {event.venue} ({seatsRemaining} seats remaining)
          </DialogDescription>
        </DialogHeader>

        {successInfo ? (
          <div className="space-y-4 py-2">
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
              <AlertDescription>
                <span className="font-semibold block text-emerald-950">Registration confirmed</span>
                <span className="mt-1 block text-xs text-emerald-900">
                  Confirmation ID: <span className="font-mono">{successInfo.registrationId}</span>
                  {' · '}
                  {successInfo.mode === 'live'
                    ? 'Saved to Amazon DynamoDB via API Gateway'
                    : 'Recorded in local Demo Mode state'}
                </span>
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-700 mt-0.5" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Aarav Patel"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">University Email</Label>
              <Input
                id="reg-email"
                type="email"
                required
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="name@university.edu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-id">Student ID</Label>
                <Input
                  id="reg-id"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="CS-2026-0418"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reg-dept">Department</Label>
                <Input
                  id="reg-dept"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={submitting || seatsRemaining === 0}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {seatsRemaining === 0 ? 'Event Full' : 'Confirm Registration'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
