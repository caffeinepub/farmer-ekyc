import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Leaf, LogOut, User } from 'lucide-react';
import { clearAgentSession, clearManagerSession, getAgentSession, getManagerSession } from '../lib/auth';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const agentSession = getAgentSession();
  const managerSession = getManagerSession();

  const handleLogout = () => {
    clearAgentSession();
    clearManagerSession();
    navigate({ to: '/' });
  };

  const userLabel = managerSession
    ? 'Manager'
    : agentSession
    ? agentSession.agentName
    : null;

  const roleLabel = managerSession ? 'Manager' : agentSession ? 'Agent' : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + App Name */}
          <div className="flex items-center gap-3">
            <div className="bg-accent rounded-full p-2 flex items-center justify-center shadow">
              <Leaf className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg text-primary-foreground tracking-tight leading-none">
                Farmer eKYC
              </span>
              <p className="text-primary-foreground/70 text-xs leading-none mt-0.5">
                Digital Identity Portal
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {userLabel && (
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-3 py-1.5">
                <User className="w-4 h-4 text-accent" />
                <div className="text-right">
                  <p className="text-primary-foreground text-xs font-semibold leading-none">
                    {userLabel}
                  </p>
                  {roleLabel && (
                    <p className="text-accent text-xs leading-none mt-0.5 font-medium">
                      {roleLabel}
                    </p>
                  )}
                </div>
              </div>
            )}
            {(agentSession || managerSession) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground gap-1.5 rounded-full"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">Logout</span>
              </Button>
            )}
          </div>
        </div>
        {title && (
          <div className="bg-primary/80 border-t border-primary-foreground/10">
            <div className="max-w-5xl mx-auto px-4 py-2">
              <h1 className="text-primary-foreground font-heading font-semibold text-sm">
                {title}
              </h1>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary/10 border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Farmer eKYC Portal. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1">
            Built with <span className="text-destructive">♥</span> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
