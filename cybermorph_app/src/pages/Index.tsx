import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Cpu, Lock, Zap, ArrowRight, Activity } from 'lucide-react';
import CyberBackground from '@/components/CyberBackground';
import FileDropzone from '@/components/FileDropzone';
import ScanProgress from '@/components/ScanProgress';
import ScanResultCard from '@/components/ScanResultCard';
import CyberButton from '@/components/CyberButton';
import Navbar from '@/components/Navbar';
import { scanApi, ScanResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();

  const handleFileScan = async (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('uploading');
    setScanResult(null);

    // Simulate progress
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

  const features = [
    {
      icon: Cpu,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning models trained on millions of malware samples',
    },
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Instant threat detection with PE file feature extraction',
    },
    {
      icon: Lock,
      title: 'Secure Processing',
      description: 'Files are analyzed locally and quarantined if threats are found',
    },
    {
      icon: Activity,
      title: 'Threat Intelligence',
      description: 'Comprehensive reports with malware probability scores',
    },
  ];

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <CyberBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-primary uppercase tracking-widest">
                AI-Powered Security
              </span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-foreground">Next-Gen </span>
              <span className="text-primary cyber-text">AntiVirus & Malware</span>
              <br />
              <span className="text-foreground">Detection System</span>
            </h1>

            <p className="font-mono text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Upload suspicious PE files and let our AI analyze them for malware signatures,
              behavioral patterns, and threat indicators in seconds.
            </p>
          </motion.div>

          {/* Scanner Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            {!isScanning ? (
              <FileDropzone onFileSelect={handleFileScan} />
            ) : scanStatus === 'complete' && scanResult ? (
              <div className="space-y-6">
                <ScanResultCard result={scanResult} />
                <div className="flex justify-center gap-4">
                  <CyberButton variant="secondary" onClick={resetScan}>
                    Scan Another File
                  </CyberButton>
                  <Link to="/auth">
                    <CyberButton variant="primary">
                      View Full Report <ArrowRight className="w-4 h-4 ml-2" />
                    </CyberButton>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-border bg-card/50">
                <ScanProgress
                  progress={scanProgress}
                  status={scanStatus}
                  result={scanResult?.verdict === 'malicious' ? 'threat' : 'safe'}
                />
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Advanced <span className="text-primary">Protection</span> Features
            </h2>
            <p className="font-mono text-muted-foreground">
              Powered by state-of-the-art machine learning technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 border border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Ready to Secure Your System?
            </h2>
            <p className="font-mono text-muted-foreground mb-8">
              Create an account to access full scan reports, history, and advanced features.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/auth?mode=register">
                <CyberButton variant="primary" size="lg" glowing>
                  Get Started Free
                </CyberButton>
              </Link>
              <Link to="/auth">
                <CyberButton variant="secondary" size="lg">
                  Sign In
                </CyberButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
<footer className="py-8 px-4 border-t border-border">
  <div className="container mx-auto text-center">
    <div className="flex items-center justify-center gap-2 mb-4">
      <span className="font-display text-lg font-bold">
        <span className="text-primary">CYBER</span>MORPH
      </span>
    </div>

    {/* Social Media Links */}
    <div className="flex justify-center gap-4 mb-4">
      <a
        href="https://twitter.com/yourhandle"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        Twitter
      </a>
      <a
        href="https://linkedin.com/in/yourprofile"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        LinkedIn
      </a>
      <a
        href="https://github.com/yourprofile"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        GitHub
      </a>
    </div>

    {/* Dynamic Year */}
    <p className="font-mono text-xs text-muted-foreground">
      © {new Date().getFullYear()} CyberMorph. AI-Powered Malware Detection & Prevention System.
    </p>
  </div>
</footer>
    </div>
  );
};

export default Index;
