import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FileText, Search, User, Sprout, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Layout from '../components/Layout';
import { getAgentSession } from '../lib/auth';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const session = getAgentSession();

  return (
    <Layout title="Agent Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="rounded-2xl overflow-hidden shadow-card">
          <div className="bg-primary px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="bg-accent rounded-full p-3 shadow">
                <User className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-xl text-primary-foreground">
                  Welcome, {session?.agentName || 'Agent'}!
                </h2>
                <p className="text-primary-foreground/70 text-sm mt-0.5">
                  Agent ID: <span className="font-mono font-semibold text-accent">{session?.agentId}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="bg-primary/10 border-t border-primary/20 px-6 py-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sprout className="w-4 h-4 text-primary" />
              Use the options below to manage farmer eKYC applications
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-heading font-semibold text-foreground text-base mb-3 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Submit eKYC Card */}
            <Card
              className="border-2 border-primary/30 hover:border-primary hover:shadow-card-hover transition-all cursor-pointer group"
              onClick={() => navigate({ to: '/agent/submit-ekyc' })}
            >
              <CardContent className="p-0">
                <div className="bg-primary/10 group-hover:bg-primary/20 transition-colors rounded-t-lg px-5 py-4 flex items-center gap-3 border-b border-primary/20">
                  <div className="bg-primary rounded-xl p-2.5 shadow">
                    <FileText className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-foreground text-base">Submit eKYC</h4>
                    <p className="text-xs text-muted-foreground">New farmer application</p>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted-foreground">
                    Register a new farmer by submitting their KYC details and documents.
                  </p>
                  <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold">
                    Start Application →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Check Status Card */}
            <Card
              className="border-2 border-accent/40 hover:border-accent hover:shadow-card-hover transition-all cursor-pointer group"
              onClick={() => navigate({ to: '/agent/check-status' })}
            >
              <CardContent className="p-0">
                <div className="bg-accent/10 group-hover:bg-accent/20 transition-colors rounded-t-lg px-5 py-4 flex items-center gap-3 border-b border-accent/20">
                  <div className="bg-accent rounded-xl p-2.5 shadow">
                    <Search className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-foreground text-base">Check Status</h4>
                    <p className="text-xs text-muted-foreground">Track application status</p>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm text-muted-foreground">
                    Look up the current status of any submitted farmer application.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3 border-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground text-xs font-semibold">
                    Check Now →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
