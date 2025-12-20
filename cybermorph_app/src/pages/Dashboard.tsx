import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, FileCheck, Clock, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CyberBackground from '@/components/CyberBackground';
import FileDropzone from '@/components/FileDropzone';
import ScanProgress from '@/components/ScanProgress';
import ScanResultCard from '@/components/ScanResultCard';
import StatCard from '@/components/StatCard';
import CyberCard from '@/components/CyberCard';
import CyberButton from '@/components/CyberButton';
import { useAuth } from '@/contexts/AuthContext';
import { scanApi, userApi, ScanResult, Stats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await userApi.getMyStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFileScan = async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('uploading');
    setScanResult(null);

    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      setScanStatus('analyzing');
      const result = await scanApi.uploadAndScan(file);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStatus('complete');
      setScanResult(result);
      setRecentScans((prev) => [result, ...prev.slice(0, 4)]);
      loadStats();

      toast({
        title: result.verdict === 'malicious' ? '⚠️ Threat Detected!' : '✓ Scan Complete',
        description: `${file.name} - ${result.verdict.toUpperCase()}`,
        variant: result.verdict === 'malicious' ? 'destructive' : 'default',
      });
    } catch (error) {
      clearInterval(progressInterval);
      setScanStatus('idle');
      setIsScanning(false);
      toast({
        title: 'Scan Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const resetScan = () => {
    setIsScanning(false);
    setScanProgress(0);
    setScanStatus('idle');
    setScanResult(null);
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <CyberBackground />
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-primary">{user?.username}</span>
            </h1>
            <p className="font-mono text-muted-foreground">
              Your security dashboard is ready. Upload files to scan for threats.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Scans"
              value={stats?.total_scans ?? 0}
              icon={FileCheck}
              variant="default"
              delay={0.1}
            />
            <StatCard
              title="Threats Detected"
              value={stats?.threats ?? 0}
              icon={AlertTriangle}
              variant={stats?.threats && stats.threats > 0 ? 'threat' : 'safe'}
              delay={0.2}
            />
            <StatCard
              title="Protection Status"
              value="Active"
              icon={Shield}
              variant="safe"
              delay={0.3}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Scanner Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                File Scanner
              </h2>

              {!isScanning ? (
                <FileDropzone onFileSelect={handleFileScan} />
              ) : scanStatus === 'complete' && scanResult ? (
                <div className="space-y-4">
                  <ScanResultCard result={scanResult} />
                  <CyberButton variant="secondary" onClick={resetScan} className="w-full">
                    Scan Another File
                  </CyberButton>
                </div>
              ) : (
                <CyberCard>
                  <ScanProgress
                    progress={scanProgress}
                    status={scanStatus}
                    result={scanResult?.verdict === 'malicious' ? 'threat' : 'safe'}
                  />
                </CyberCard>
              )}
            </motion.div>

            {/* Recent Scans */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Scans
              </h2>

              {recentScans.length > 0 ? (
                <div className="space-y-4">
                  {recentScans.map((scan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <ScanResultCard result={scan} showDetails={false} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <CyberCard>
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-mono text-muted-foreground">
                      No scans yet. Upload a file to get started.
                    </p>
                  </div>
                </CyberCard>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
