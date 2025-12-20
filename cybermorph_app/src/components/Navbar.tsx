import { Link, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import CyberButton from './CyberButton';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
            </motion.div>
            <span className="font-display font-bold text-xl tracking-wider">
              <span className="text-primary">CYBER</span>
              <span className="text-foreground">MORPH</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 font-mono text-sm transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 font-mono text-sm transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                <div className="flex items-center gap-4 pl-4 border-l border-border">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm text-foreground">
                      {user?.username}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-primary/20 text-primary">
                      {user?.role}
                    </span>
                  </div>
                  <CyberButton
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </CyberButton>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <CyberButton variant="secondary" size="sm">
                    Login
                  </CyberButton>
                </Link>
                <Link to="/auth?mode=register">
                  <CyberButton variant="primary" size="sm">
                    Register
                  </CyberButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
