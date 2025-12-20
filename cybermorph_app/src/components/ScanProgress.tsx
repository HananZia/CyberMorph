import { motion } from 'framer-motion';
import { Shield, Search, FileCode, CheckCircle, AlertTriangle } from 'lucide-react';

interface ScanProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'analyzing' | 'complete';
  result?: 'safe' | 'threat' | null;
}

const stages = [
  { icon: Shield, label: 'Initializing scan...', threshold: 10 },
  { icon: Search, label: 'Extracting PE features...', threshold: 30 },
  { icon: FileCode, label: 'Running AI analysis...', threshold: 60 },
  { icon: CheckCircle, label: 'Generating report...', threshold: 90 },
];

const ScanProgress = ({ progress, status, result }: ScanProgressProps) => {
  const currentStage = stages.findIndex((s) => progress < s.threshold);
  const stage = currentStage === -1 ? stages.length - 1 : currentStage;

  const Icon = status === 'complete' 
    ? (result === 'threat' ? AlertTriangle : CheckCircle)
    : stages[stage]?.icon || Shield;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="relative h-2 bg-secondary overflow-hidden">
        <motion.div
          className={`h-full ${
            result === 'threat' 
              ? 'bg-gradient-to-r from-destructive to-destructive/80' 
              : 'bg-gradient-to-r from-primary to-primary/80'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
        {/* Scanning line effect */}
        {status !== 'complete' && (
          <motion.div
            className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            animate={{ x: ['-100%', '500%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Status display */}
      <div className="flex items-center justify-center gap-4">
        <motion.div
          animate={status === 'complete' ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: status === 'complete' ? 0 : Infinity, ease: 'linear' }}
        >
          <Icon
            className={`w-8 h-8 ${
              result === 'threat' 
                ? 'text-destructive' 
                : result === 'safe' 
                  ? 'text-success' 
                  : 'text-primary'
            }`}
          />
        </motion.div>
        <div className="text-center">
          <p className="font-mono text-sm text-muted-foreground">
            {status === 'complete' 
              ? (result === 'threat' ? 'Threat Detected!' : 'Scan Complete - No Threats')
              : stages[stage]?.label || 'Processing...'}
          </p>
          <p className="font-mono text-xs text-primary mt-1">{Math.round(progress)}%</p>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-between px-4">
        {stages.map((s, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-1 ${
              i <= stage ? 'text-primary' : 'text-muted-foreground/30'
            }`}
          >
            <s.icon className="w-4 h-4" />
            <span className="text-[10px] font-mono hidden sm:block">{s.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScanProgress;
