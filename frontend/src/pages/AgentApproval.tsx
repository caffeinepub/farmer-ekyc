import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Users, CheckCircle, XCircle, ArrowLeft, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAgentListQuery, useUpdateAgentStatusMutation, getStatusString } from '../hooks/useQueries';
import type { Agent } from '../backend';

export default function AgentApproval() {
  const navigate = useNavigate();
  const { data: agentsRaw, isLoading } = useAgentListQuery();
  const updateStatusMutation = useUpdateAgentStatusMutation();
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const agents = (agentsRaw as unknown as Agent[]) || [];
  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.mobile.includes(search)
  );

  const handleStatus = async (agentId: string, status: 'approved' | 'rejected') => {
    setProcessingId(agentId);
    try {
      await updateStatusMutation.mutateAsync({ agentId, status });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatus = (agent: Agent): 'pending' | 'approved' | 'rejected' => {
    const s = getStatusString(agent.status);
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  };

  return (
    <Layout title="Agent Approval">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate({ to: '/manager/dashboard' })} className="gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Agent Approval
          </h2>
        </div>

        <Card className="border-2 border-primary/30 shadow-card">
          <CardHeader className="bg-primary/10 border-b border-primary/20 rounded-t-lg pb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-foreground font-heading text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Registered Agents ({agents.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search agents..."
                  className="pl-9 border-border focus:border-primary text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No agents found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(agent => {
                  const status = getStatus(agent);
                  const isProcessing = processingId === agent.id;
                  return (
                    <div key={agent.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-semibold text-foreground">{agent.name}</span>
                          <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">{agent.id}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                          <span>📱 {agent.mobile}</span>
                          <span>✉️ {agent.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={status} />
                        {status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatus(agent.id, 'approved')}
                              disabled={isProcessing}
                              className="bg-success hover:bg-success/90 text-success-foreground gap-1 text-xs"
                            >
                              {isProcessing ? <span className="animate-spin rounded-full h-3 w-3 border-2 border-success-foreground border-t-transparent" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatus(agent.id, 'rejected')}
                              disabled={isProcessing}
                              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1 text-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
