import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
}

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = 'primary', size = 'md', glowing = false, children, ...props }, ref) => {
    const baseStyles = `
      relative font-mono font-medium tracking-wider uppercase
      border transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden
    `;

    const variants = {
      primary: `
        bg-primary/10 border-primary text-primary
        hover:bg-primary hover:text-primary-foreground
        hover:shadow-[0_0_30px_hsl(180_100%_50%/0.5)]
      `,
      secondary: `
        bg-secondary border-border text-foreground
        hover:border-primary hover:text-primary
        hover:shadow-[0_0_20px_hsl(180_100%_50%/0.3)]
      `,
      danger: `
        bg-destructive/10 border-destructive text-destructive
        hover:bg-destructive hover:text-destructive-foreground
        hover:shadow-[0_0_30px_hsl(340_100%_60%/0.5)]
      `,
      ghost: `
        bg-transparent border-transparent text-muted-foreground
        hover:text-primary hover:border-primary/50
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glowing && 'animate-pulse-glow',
          className
        )}
        {...(props as any)}
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      </motion.button>
    );
  }
);

CyberButton.displayName = 'CyberButton';

export default CyberButton;
