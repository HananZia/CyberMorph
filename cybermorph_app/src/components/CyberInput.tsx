import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              `w-full px-4 py-3 font-mono text-sm
              bg-secondary/50 border border-border
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
              focus:shadow-[0_0_20px_hsl(180_100%_50%/0.2)]
              transition-all duration-300`,
              error && 'border-destructive focus:border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
          <div className="absolute inset-0 pointer-events-none border border-primary/0 transition-all duration-300 group-focus-within:border-primary/50" />
        </div>
        {error && (
          <p className="text-xs text-destructive font-mono">{error}</p>
        )}
      </div>
    );
  }
);

CyberInput.displayName = 'CyberInput';

export default CyberInput;
