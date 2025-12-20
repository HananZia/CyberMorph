import { FileCode, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import CyberCard from './CyberCard';
import ThreatMeter from './ThreatMeter';
import { ScanResult } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ScanResultCardProps {
  result: ScanResult;
  showDetails?: boolean;
}

const ScanResultCard = ({ result, showDetails = true }: ScanResultCardProps) => {
  const isThreat = result.verdict === 'malicious' || result.verdict === 'suspicious';
  const probability = result.malware_probability ?? result.score ?? 0;

  return (
    <CyberCard
      variant={isThreat ? 'threat' : 'safe'}
      glowing
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Threat Meter */}
        <ThreatMeter probability={probability} size="md" />

        {/* File Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
            <FileCode className="w-5 h-5 text-primary" />
            <span className="font-mono text-lg text-foreground truncate max-w-[200px]">
              {result.filename}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-center md:justify-start">
            {isThreat ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : (
              <CheckCircle className="w-4 h-4 text-success" />
            )}
            <span
              className={cn(
                'font-mono text-sm uppercase tracking-widest',
                isThreat ? 'text-destructive' : 'text-success'
              )}
            >
              {result.verdict || result.status}
            </span>
          </div>

          {result.created_at && (
            <div className="flex items-center gap-2 justify-center md:justify-start mt-2 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="font-mono text-xs">
                {new Date(result.created_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Additional Details */}
        {showDetails && result.details && (
          <div className="w-full md:w-auto">
            <p className="font-mono text-xs text-muted-foreground bg-secondary/50 p-3">
              {result.details}
            </p>
          </div>
        )}
      </div>
    </CyberCard>
  );
};

export default ScanResultCard;
