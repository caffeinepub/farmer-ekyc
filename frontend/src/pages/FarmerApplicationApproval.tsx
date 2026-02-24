import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ClipboardCheck, CheckCircle, XCircle, ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useApplicationListQuery, useUpdateApplicationStatusMutation, getStatusString } from '../hooks/useQueries';
import { formatDate } from '../lib/utils';
import type { FarmerEKYCApplication } from '../backend';

export default function FarmerApplicationApproval() {
  const navigate = useNavigate();
  const { data: appsRaw, isLoading } = useApplicationListQuery();
  const updateStatusMutation = useUpdateApplicationStatusMutation();
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const applications = (appsRaw as unknown as FarmerEKYCApplication[]) || [];
  const filtered = applications.filter(a =>
    a.farmerName.toLowerCase().includes(search.toLowerCase()) ||
    a.acknowledgmentNumber.includes(search) ||
    a.agentId.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatus = async (ackNumber: string, status: 'approved' | 'rejected') => {
    setProcessingId(ackNumber);
    try {
      await updateStatusMutation.mutateAsync({ ackNumber, status });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatus = (app: FarmerEKYCApplication): 'pending' | 'approved' | 'rejected' => {
    const s = getStatusString(app.status);
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  };

  return (
    <Layout title="Application Approval">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate({ to: '/manager/dashboard' })} className="gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" /> Application Approval
          </h2>
        </div>

        <Card className="border-2 border-primary/30 shadow-card">
          <CardHeader className="bg-primary/10 border-b border-primary/20 rounded-t-lg pb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-foreground font-heading text-base flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Farmer Applications ({applications.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search applications..."
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
                <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-medium">No applications found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(app => {
                  const status = getStatus(app);
                  const isProcessing = processingId === app.acknowledgmentNumber;
                  const isExpanded = expandedId === app.acknowledgmentNumber;
                  return (
                    <div key={app.acknowledgmentNumber} className="hover:bg-muted/20 transition-colors">
                      <div
                        className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : app.acknowledgmentNumber)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-heading font-semibold text-foreground">{app.farmerName}</span>
                            <span className="text-xs font-mono bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full border border-accent/20">
                              #{app.acknowledgmentNumber}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                            <span>📱 {app.mobile}</span>
                            <span>🧑‍💼 Agent: {app.agentId}</span>
                            <span>📅 {formatDate(app.submittedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge status={status} />
                          {status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={e => { e.stopPropagation(); handleStatus(app.acknowledgmentNumber, 'approved'); }}
                                disabled={isProcessing}
                                className="bg-success hover:bg-success/90 text-success-foreground gap-1 text-xs"
                              >
                                {isProcessing ? <span className="animate-spin rounded-full h-3 w-3 border-2 border-success-foreground border-t-transparent" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={e => { e.stopPropagation(); handleStatus(app.acknowledgmentNumber, 'rejected'); }}
                                disabled={isProcessing}
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-1 text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </Button>
                            </>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-5 pb-4 bg-muted/20 border-t border-border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                            <div className="space-y-2">
                              <DetailRow label="Aadhaar" value={app.aadhaarNumber} />
                              <DetailRow label="PAN" value={app.panNumber} />
                              <DetailRow label="Mobile" value={app.mobile} />
                            </div>
                            <div className="space-y-2">
                              <DetailRow label="Address" value={app.address} />
                              {app.otherDetails && <DetailRow label="Other Details" value={app.otherDetails} />}
                            </div>
                          </div>
                        </div>
                      )}
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
}
