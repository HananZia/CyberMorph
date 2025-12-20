import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import CyberCard from './CyberCard';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'threat' | 'safe' | 'warning';
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, variant = 'default', trend, delay = 0 }: StatCardProps) => {
  const iconColors = {
    default: 'text-primary',
    threat: 'text-destructive',
    safe: 'text-success',
    warning: 'text-warning',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <CyberCard variant={variant} glowing>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {title}
            </p>
            <motion.p
              className="font-display text-3xl font-bold text-foreground"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2, type: 'spring' }}
            >
              {value}
            </motion.p>
            {trend && (
              <p
                className={cn(
                  'font-mono text-xs mt-2',
                  trend.isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
              </p>
            )}
          </div>
          <div className={cn('p-3 bg-secondary/50', iconColors[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CyberCard>
    </motion.div>
  );
};

export default StatCard;
