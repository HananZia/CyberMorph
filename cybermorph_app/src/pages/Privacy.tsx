import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CyberBackground from '@/components/CyberBackground';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background matrix-bg">
      <CyberBackground />
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-border bg-card/50 p-8 cyber-border"
          >
            <h1 className="font-display text-4xl font-bold mb-6 cyber-text">
              Privacy Policy
            </h1>

            <p className="font-mono text-muted-foreground mb-6">
              CyberMorph respects your privacy and is designed with security-first
              principles.
            </p>

            <div className="space-y-6 font-mono text-sm text-muted-foreground">
              <div>
                <h2 className="text-primary font-semibold mb-2">
                  1. Data Collection
                </h2>
                <p>
                  Files submitted for scanning are analyzed temporarily and are
                  not stored permanently unless explicitly required for logging.
                </p>
              </div>

              <div>
                <h2 className="text-primary font-semibold mb-2">
                  2. Local Analysis
                </h2>
                <p>
                  CyberMorph prioritizes local and secure processing wherever
                  possible to minimize data exposure.
                </p>
              </div>

              <div>
                <h2 className="text-primary font-semibold mb-2">
                  3. No Data Sharing
                </h2>
                <p>
                  We do not sell, share, or distribute user data to third parties.
                </p>
              </div>

              <div>
                <h2 className="text-primary font-semibold mb-2">
                  4. Security
                </h2>
                <p>
                  Industry-standard security practices are followed to protect
                  system integrity and user privacy.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
