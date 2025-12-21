import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CyberBackground from "@/components/CyberBackground";
import { Link } from "react-router-dom";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message }),
});

      if (!response.ok) throw new Error("Failed to send message");

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <CyberBackground />
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-border bg-card/50 p-8 cyber-border"
          >
            <h1 className="font-display text-4xl font-bold mb-6 cyber-text text-center">
              Contact Us
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-mono mb-1 text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border bg-background text-foreground rounded"
                />
              </div>

              <div>
                <label className="block font-mono mb-1 text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border bg-background text-foreground rounded"
                />
              </div>

              <div>
                <label className="block font-mono mb-1 text-muted-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-border bg-background text-foreground rounded h-32 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="bg-primary text-background px-6 py-2 font-bold rounded hover:bg-primary/80 transition-all cyber-text"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>

              {status === "success" && (
                <p className="text-success mt-2 font-mono">Message sent successfully!</p>
              )}
              {status === "error" && (
                <p className="text-destructive mt-2 font-mono">Failed to send message. Try again.</p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-12">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="font-display text-lg font-bold">
              <span className="text-primary">CYBER</span>MORPH
            </span>
          </div>

          {/* Internal Page Links */}
          <div className="flex justify-center gap-4 mb-4">
            <Link
              to="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy-policy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
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

export default Contact;
