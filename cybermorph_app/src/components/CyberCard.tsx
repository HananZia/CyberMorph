import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CyberCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'threat' | 'safe' | 'warning';
  glowing?: boolean;
  hoverable?: boolean;
}

const CyberCard = ({
  children,
  className,
  variant = 'default',
  glowing = false,
  hoverable = false,
}: CyberCardProps) => {
  const variants = {
    default: 'border-border bg-card',
    threat: 'border-destructive/50 bg-destructive/5',
    safe: 'border-success/50 bg-success/5',
    warning: 'border-warning/50 bg-warning/5',
  };

  const glowColors = {
    default: 'shadow-[0_0_30px_hsl(180_100%_50%/0.2)]',
    threat: 'shadow-[0_0_30px_hsl(340_100%_60%/0.3)]',
    safe: 'shadow-[0_0_30px_hsl(160_100%_50%/0.3)]',
    warning: 'shadow-[0_0_30px_hsl(40_100%_50%/0.3)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { scale: 1.02, y: -5 } : undefined}
      className={cn(
        'relative p-6 border backdrop-blur-sm',
        variants[variant],
        glowing && glowColors[variant],
        hoverable && 'cursor-pointer transition-all duration-300',
        className
      )}
    >
      {/* Corner decorations */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />
      
      {children}
    </motion.div>
  );
};

export default CyberCard;
