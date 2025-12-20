import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, FileSearch, AlertTriangle, Trash2,
  Activity, TrendingUp, Clock, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import CyberBackground from '@/components/CyberBackground';
import StatCard from '@/components/StatCard';
import CyberCard from '@/components/CyberCard';
import CyberButton from '@/components/CyberButton';
import ThreatMeter from '@/components/ThreatMeter';
import { adminApi, User, ScanResult, Stats } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AdminTab = 'overview' | 'users' | 'scans' | 'alerts';

const Admin = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, scansData, alertsData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getScans(),
        adminApi.getAlerts(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setScans(scansData);
      setAlerts(alertsData);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Could not fetch admin data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast({ title: 'User deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const handleDeleteScan = async (scanId: number) => {
  try {
    await adminApi.deleteScan(scanId);
    setScans(prev => prev.filter(s => s.id !== scanId));
    toast({ title: "Scan deleted successfully" });
  } catch (error: any) {
    toast({
      title: "Failed to delete scan",
      description: error.message || "An error occurred",
      variant: "destructive",
    });
  }
};


  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'scans', label: 'Scan Logs', icon: FileSearch },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  ];

  const threatRate = stats ? (stats.threats / Math.max(stats.total_scans, 1)) : 0;

  return (
    <div className="min-h-screen bg-background matrix-bg">
      <CyberBackground />
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Admin <span className="text-primary">Control Panel</span>
              </h1>
              <p className="font-mono text-muted-foreground">
                Manage users, monitor scans, and review security alerts.
              </p>
            </div>
            <CyberButton
              variant="secondary"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              Refresh
            </CyberButton>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <CyberButton
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </CyberButton>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats?.users ?? 0}
                  icon={Users}
                  delay={0.1}
                />
                <StatCard
                  title="Total Scans"
                  value={stats?.total_scans ?? 0}
                  icon={FileSearch}
                  delay={0.2}
                />
                <StatCard
                  title="Threats Detected"
                  value={stats?.threats ?? 0}
                  icon={AlertTriangle}
                  variant="threat"
                  delay={0.3}
                />
                <StatCard
                  title="System Status"
                  value="Online"
                  icon={Shield}
                  variant="safe"
                  delay={0.4}
                />
              </div>

              {/* Threat Overview */}
              <div className="grid lg:grid-cols-2 gap-6">
                <CyberCard glowing>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-6">
                    Threat Detection Rate
                  </h3>
                  <div className="flex items-center justify-center">
                    <ThreatMeter probability={threatRate} size="lg" />
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-success/10 border border-success/30">
                      <p className="font-display text-2xl font-bold text-success">
                        {stats ? stats.total_scans - stats.threats : 0}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">Clean Files</p>
                    </div>
                    <div className="p-3 bg-destructive/10 border border-destructive/30">
                      <p className="font-display text-2xl font-bold text-destructive">
                        {stats?.threats ?? 0}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">Threats</p>
                    </div>
                  </div>
                </CyberCard>

                <CyberCard glowing>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-6">
                    Recent Alerts
                  </h3>
                  {alerts.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {alerts.slice(0, 5).map((alert, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-destructive/10 border border-destructive/30"
                        >
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm text-foreground truncate">
                              {alert.filename}
                            </p>
                            <p className="font-mono text-xs text-muted-foreground">
                              Probability: {(alert.probability * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="w-12 h-12 text-success mx-auto mb-4" />
                      <p className="font-mono text-muted-foreground">No recent alerts</p>
                    </div>
                  )}
                </CyberCard>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CyberCard>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          ID
                        </th>
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Username
                        </th>
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Role
                        </th>
                        <th className="text-right py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border/50 hover:bg-primary/5"
                        >
                          <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                            {user.id}
                          </td>
                          <td className="py-3 px-4 font-mono text-sm text-foreground">
                            {user.username}
                          </td>
                          <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-1 text-xs font-mono uppercase',
                                user.role === 'admin'
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-secondary text-muted-foreground'
                              )}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <CyberButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </CyberButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CyberCard>
            </motion.div>
          )}

          {/* Scans Tab */}
          {activeTab === 'scans' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CyberCard>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          File
                        </th>
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Verdict
                        </th>
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Score
                        </th>
                        <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Date
                        </th>
                        <th className="text-right py-3 px-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.map((scan) => (
                      <tr
    key={scan.id ?? Math.random()} // fallback key if id missing
    className="border-b border-border/50 hover:bg-primary/5"
  >
    <td className="py-3 px-4 font-mono text-sm text-foreground">{scan.filename}</td>
    <td className="py-3 px-4">
      <span
        className={cn(
          'px-2 py-1 text-xs font-mono uppercase',
          scan.verdict === 'malicious'
            ? 'bg-destructive/20 text-destructive'
            : scan.verdict === 'suspicious'
            ? 'bg-warning/20 text-warning'
            : 'bg-success/20 text-success'
        )}
      >
        {scan.verdict}
      </span>
    </td>
    <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
      {((scan.malware_probability ?? scan.score ?? 0) * 100).toFixed(1)}%
    </td>
    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
      {scan.created_at ? new Date(scan.created_at).toLocaleString() : "-"}
    </td>
    <td className="py-3 px-4 text-right">
      <CyberButton
        variant="danger"
        size="sm"
        onClick={() => {
          if (typeof scan.id === "number") {
            handleDeleteScan(scan.id);
          } else {
            toast({
              title: "Cannot delete scan",
              description: "Scan ID is missing",
              variant: "destructive",
            });
          }
        }}
      >
        <Trash2 className="w-4 h-4" />
      </CyberButton>
    </td>
  </tr>
                            ))}
                    </tbody>
                  </table>
                </div>
              </CyberCard>
            </motion.div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {alerts.length > 0 ? (
                <div className="grid gap-4">
                  {alerts.map((alert, index) => (
                    <CyberCard key={index} variant="threat">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                        <div className="flex-1">
                          <p className="font-mono text-lg text-foreground">
                            {alert.filename}
                          </p>
                          <p className="font-mono text-sm text-muted-foreground">
                            Malware probability: {(alert.probability * 100).toFixed(2)}%
                          </p>
                        </div>
                        <ThreatMeter probability={alert.probability} size="sm" showLabel={false} />
                      </div>
                    </CyberCard>
                  ))}
                </div>
              ) : (
                <CyberCard>
                  <div className="text-center py-16">
                    <Shield className="w-16 h-16 text-success mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      All Clear
                    </h3>
                    <p className="font-mono text-muted-foreground">
                      No malware alerts at this time.
                    </p>
                  </div>
                </CyberCard>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
