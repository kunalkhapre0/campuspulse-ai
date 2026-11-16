import { useMemo, useState } from 'react';
import { Search, CheckCircle2, MapPin, Users, Calendar } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { EventImage } from '@/src/components/shared/EventImage';
import { EVENT_CATEGORIES } from '@/src/data/demoData';
import type { CampusEvent, EventCategory, EventRegistration } from '@/src/types/campus';
import { cn } from '@/src/lib/utils';

interface EventDiscoveryPageProps {
  events: CampusEvent[];
  registrations: EventRegistration[];
  activeStudentEmail: string;
  loading: boolean;
  onSelectEvent: (eventId: string) => void;
  onOpenRegisterModal: (event: CampusEvent) => void;
}

export function EventDiscoveryPage({
  events,
  registrations,
  activeStudentEmail,
  loading,
  onSelectEvent,
  onOpenRegisterModal,
}: EventDiscoveryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const registeredIds = useMemo(() => {
    const email = activeStudentEmail.trim().toLowerCase();
    return new Set(
      registrations
        .filter((r) => r.studentEmail.toLowerCase() === email)
        .map((r) => r.eventId)
    );
  }, [registrations, activeStudentEmail]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return events.filter((evt) => {
      if (selectedCategory !== 'All' && evt.category !== selectedCategory) return false;
      if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
      if (!q) return true;
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        evt.organizerName.toLowerCase().includes(q)
      );
    });
  }, [events, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-orange-600">Event Catalog</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Discover Campus Events
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Browse upcoming workshops, hackathons, and labs with live seat availability.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, venue, organizer..."
            className="pl-9"
            aria-label="Search campus events"
          />
        </div>
      </div>

      {/* Category & Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer',
              selectedCategory === 'All'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            All Categories
          </button>
          {EVENT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                selectedCategory === category
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          {(
            [
              { id: 'all', label: 'All Dates' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="h-[420px] rounded-xl border border-slate-200 bg-white animate-pulse"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <Calendar className="mx-auto h-9 w-9 text-slate-400" />
          <h2 className="mt-3 font-display text-base font-semibold text-slate-900">
            No matching campus events
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Try clearing your search filter or selecting another event category.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStatusFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const seatsRemaining = Math.max(0, evt.capacity - evt.registeredCount);
            const fillRatio = Math.min(100, Math.round((evt.registeredCount / evt.capacity) * 100));
            const isRegistered = registeredIds.has(evt.id);
            const isClosedOrPast = evt.status === 'past' || evt.status === 'closed';

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
                      <span className="font-mono tabular-nums">
                        {evt.date} {evt.startTime}–{evt.endTime}
                      </span>
                    </p>

                    <button
                      type="button"
                      onClick={() => onSelectEvent(evt.id)}
                      className="mt-2 text-left font-display text-lg font-semibold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      {evt.title}
                    </button>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>
                          Organizer: {evt.organizerName} ({evt.organizerDepartment})
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono text-slate-700 tabular-nums">
                          {evt.registeredCount} / {evt.capacity} registered
                        </span>
                        <span
                          className={cn(
                            'font-medium tabular-nums',
                            seatsRemaining === 0
                              ? 'text-red-600'
                              : seatsRemaining <= 15
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          )}
                        >
                          {isClosedOrPast
                            ? evt.status === 'past'
                              ? 'Completed'
                              : 'Closed'
                            : seatsRemaining === 0
                            ? 'Full'
                            : `${seatsRemaining} seats available`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            fillRatio >= 95 ? 'bg-amber-600' : 'bg-slate-900'
                          )}
                          style={{ width: `${fillRatio}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onSelectEvent(evt.id)}
                      >
                        Details
                      </Button>

                      {isRegistered ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                          onClick={() => onSelectEvent(evt.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Registered
                        </Button>
                      ) : (
                        <Button
                          variant="accent"
                          size="sm"
                          className="flex-1"
                          disabled={isClosedOrPast || seatsRemaining === 0}
                          onClick={() => onOpenRegisterModal(evt)}
                        >
                          {isClosedOrPast
                            ? 'Ended'
                            : seatsRemaining === 0
                            ? 'Full'
                            : 'Register'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
