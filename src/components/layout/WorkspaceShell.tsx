import { useState, type ReactNode } from 'react';
import {
  BarChart3,
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  Layers,
  Menu,
  PlusCircle,
  Sparkles,
  X,
  Info,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import type { AppView } from '@/src/types/campus';

interface WorkspaceShellProps {
  currentView: AppView;
  pageTitle: string;
  isLiveMode: boolean;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
}

const NAV_ITEMS: Array<{
  id: AppView;
  label: string;
  section: 'student' | 'organizer' | 'platform';
  icon: typeof LayoutDashboard;
}> = [
  { id: 'student-dashboard', label: 'Student Dashboard', section: 'student', icon: LayoutDashboard },
  { id: 'events', label: 'Discover Events', section: 'student', icon: CalendarDays },
  { id: 'organizer-dashboard', label: 'Organizer Studio', section: 'organizer', icon: BarChart3 },
  { id: 'create-event', label: 'Create Event', section: 'organizer', icon: PlusCircle },
  { id: 'ai-insights', label: 'AI Insights', section: 'organizer', icon: Sparkles },
  { id: 'reports', label: 'Automated Reports', section: 'organizer', icon: FileText },
  { id: 'architecture', label: 'AWS Architecture', section: 'platform', icon: Layers },
];

export function WorkspaceShell({
  currentView,
  pageTitle,
  isLiveMode,
  onNavigate,
  children,
}: WorkspaceShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectNav = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  const renderNavContent = () => (
    <div className="flex h-full flex-col justify-between px-4 py-6">
      <div className="space-y-6">
        <div className="px-2">
          <button
            type="button"
            onClick={() => handleSelectNav('landing')}
            className="font-display text-lg font-bold tracking-tight text-white hover:text-orange-400 transition-colors cursor-pointer"
          >
            CampusPulse AI
          </button>
        </div>

        <nav className="space-y-5" aria-label="Workspace navigation">
          <div>
            <p className="px-2.5 text-[11px] font-medium text-slate-400 mb-2">Student</p>
            <div className="space-y-1">
              {NAV_ITEMS.filter((i) => i.section === 'student').map((item) => {
                const Icon = item.icon;
                const active =
                  currentView === item.id ||
                  (item.id === 'events' && currentView === 'event-details');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                      active
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-2.5 text-[11px] font-medium text-slate-400 mb-2">
              Organizer & Intelligence
            </p>
            <div className="space-y-1">
              {NAV_ITEMS.filter((i) => i.section === 'organizer').map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                      active
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="px-2.5 text-[11px] font-medium text-slate-400 mb-2">Infrastructure</p>
            <div className="space-y-1">
              {NAV_ITEMS.filter((i) => i.section === 'platform').map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectNav(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                      active
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 px-2">
        <button
          type="button"
          onClick={() => handleSelectNav('landing')}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Back to Homepage</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-950 border-r border-slate-800 sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-slate-950 h-full shadow-xl">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2 text-sm truncate">
                <span className="text-slate-400 hidden sm:inline">CampusPulse AI</span>
                <span className="text-slate-300 hidden sm:inline" aria-hidden="true">/</span>
                <span className="font-display font-semibold text-slate-900 truncate">
                  {pageTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectNav('architecture')}
                className="hidden sm:inline-flex"
              >
                {isLiveMode ? 'Live AWS API' : 'Demo Mode'}
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => handleSelectNav('create-event')}
              >
                Create Event
              </Button>
            </div>
          </div>

          {!isLiveMode && (
            <div className="border-t border-amber-200 bg-amber-50/90 px-4 sm:px-8 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
              <p className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Demo Mode:</strong> Displaying synthetic sample data because{' '}
                  <span className="font-mono">VITE_API_BASE_URL</span> is not configured. AWS
                  operations are not executed remotely.
                </span>
              </p>
              <button
                type="button"
                onClick={() => handleSelectNav('architecture')}
                className="font-medium text-amber-900 underline underline-offset-2 hover:text-orange-700 whitespace-nowrap shrink-0 text-left cursor-pointer"
              >
                Connect AWS API Gateway
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
