import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThreatMeterProps {
  probability: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThreatMeter = ({ probability, size = 'md', showLabel = true }: ThreatMeterProps) => {
  const percentage = Math.round(probability * 100);
  
  const getThreatLevel = () => {
    if (probability >= 0.8) return { label: 'HIGH RISK', color: 'destructive' };
    if (probability >= 0.5) return { label: 'SUSPICIOUS', color: 'warning' };
    return { label: 'BENIGN', color: 'success' };
  };

  const threat = getThreatLevel();
  
  const sizes = {
    sm: { width: 80, height: 80, stroke: 6 },
    md: { width: 120, height: 120, stroke: 8 },
    lg: { width: 160, height: 160, stroke: 10 },
  };

  const { width, height, stroke } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (probability * circumference);

  const colors = {
    destructive: 'hsl(340 100% 60%)',
    warning: 'hsl(40 100% 50%)',
    success: 'hsl(160 100% 50%)',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width, height }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={width}
          height={height}
        >
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="hsl(var(--secondary))"
            strokeWidth={stroke}
            fill="none"
          />
          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke={colors[threat.color as keyof typeof colors]}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 10px ${colors[threat.color as keyof typeof colors]})`,
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn(
              'font-display font-bold',
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl',
              threat.color === 'destructive' && 'text-destructive',
              threat.color === 'warning' && 'text-warning',
              threat.color === 'success' && 'text-success'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      
      {showLabel && (
        <motion.span
          className={cn(
            'font-mono text-xs tracking-widest',
            threat.color === 'destructive' && 'text-destructive threat-text',
            threat.color === 'warning' && 'text-warning',
            threat.color === 'success' && 'text-success safe-text'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {threat.label}
        </motion.span>
      )}
    </div>
  );
};

export default ThreatMeter;
