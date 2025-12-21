import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CyberBackground from '@/components/CyberBackground';

const Terms = () => {
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
              Terms & Conditions
            </h1>

            <p className="font-mono text-muted-foreground mb-6">
              Welcome to CyberMorph. By using our AI-powered antivirus and malware
              detection system, you agree to the following terms.
            </p>

            <div className="space-y-6 font-mono text-sm text-muted-foreground">
              <div>
                <h2 className="text-primary font-semibold mb-2">1. Usage</h2>
                <p>
                  CyberMorph is intended for educational and security analysis
                  purposes. You must not use the system for illegal or malicious
                  activities.
                </p>
              </div>

              <div>
                <h2 className="text-primary font-semibold mb-2">2. Malware Analysis</h2>
                <p>
                  Uploaded files are analyzed using AI models trained on static
                  features. Results are probabilistic and should not be considered
                  absolute guarantees.
                </p>
              </div>

              <div>
                <h2 className="text-primary font-semibold mb-2">3. Liability</h2>
                <p>
                  CyberMorph is not responsible for system damage, data loss, or
                  misuse of scan results.
                </p>
              </div>

              <div>
                <h2 className="text-primary font-semibold mb-2">4. Updates</h2>
                <p>
                  These terms may be updated as the system evolves. Continued use
                  indicates acceptance of changes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
