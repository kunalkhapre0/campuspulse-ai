import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface EventImageProps {
  src?: string;
  alt: string;
  title: string;
  category?: string;
  className?: string;
}

export function EventImage({ src, alt, title, category, className }: EventImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-center text-white',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/10">
          <Calendar className="h-5 w-5 text-orange-400" />
        </div>
        {category && (
          <p className="text-xs font-medium text-orange-300">{category}</p>
        )}
        <p className="mt-1 line-clamp-2 font-display text-sm font-semibold text-white">
          {title}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
