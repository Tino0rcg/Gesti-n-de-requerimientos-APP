import { Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Ticket className="size-6 text-primary" />
      <span className="text-xl font-bold text-primary">ServiDesk</span>
    </div>
  );
}
