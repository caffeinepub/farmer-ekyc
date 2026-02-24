import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useGetApplicationByAckNumberQuery, getStatusString } from '../hooks/useQueries';
import { formatDate } from '../lib/utils';

export default function CheckApplicationStatus() {
  const navigate = useNavigate();
  const [ackNumber, setAckNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: appRaw, isLoading, error } = useGetApplicationByAckNumberQuery(searchTerm);
  const application = appRaw as any;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(ackNumber.trim());
  };

  const getStatus = (): 'pending' | 'approved' | 'rejected' => {
    if (!application) return 'pending';
    const s = getStatusString(application.status);
    if (s === 'approved') return 'approved';
    if (s === 'rejected') return 'rejected';
    return 'pending';
  };

  return (
    <Layout title="Check Application Status">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate({ to: '/agent/dashboard' })} className="gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading font-bold text-xl text-foreground">Check Application Status</h2>
        </div>

        {/* Search Card */}
        <Card className="border-2 border-primary/30 shadow-card">
          <CardHeader className="bg-primary rounded-t-lg pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-full p-2">
                <Search className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-primary-foreground font-heading text-lg">Search Application</CardTitle>
                <CardDescription className="text-primary-foreground/70 text-sm">Enter the 14-digit acknowledgment number</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="ackNumber" className="text-foreground font-semibold text-sm">Acknowledgment Number</Label>
                <Input
                  id="ackNumber"
                  value={ackNumber}
                  onChange={e => setAckNumber(e.target.value)}
                  placeholder="Enter 14-digit acknowledgment number"
                  className="border-border focus:border-primary focus:ring-primary/30 font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={isLoading || !ackNumber.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                >
                  {isLoading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" /> : <Search className="w-4 h-4" />}
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searchTerm && (
          <>
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <span className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            )}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm">
                Error fetching application. Please try again.
              </div>
            )}
            {!isLoading && !error && !application && (
              <Card className="border-2 border-border shadow-card">
                <CardContent className="py-10 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="font-medium text-muted-foreground">No application found</p>
                  <p className="text-xs text-muted-foreground mt-1">Check the acknowledgment number and try again</p>
                </CardContent>
              </Card>
            )}
            {!isLoading && !error && application && (
              <Card className="border-2 border-primary/30 shadow-card">
                <CardHeader className="bg-primary/10 border-b border-primary/20 rounded-t-lg pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-foreground font-heading text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Application Details
                    </CardTitle>
                    <StatusBadge status={getStatus()} />
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailRow label="Farmer Name" value={application.farmerName} />
                    <DetailRow label="Mobile" value={application.mobile} />
                    <DetailRow label="Aadhaar Number" value={application.aadhaarNumber} />
                    <DetailRow label="PAN Number" value={application.panNumber} />
                    <DetailRow label="Agent ID" value={application.agentId} />
                    <DetailRow label="Submitted On" value={formatDate(application.submittedAt)} />
                    <div className="sm:col-span-2">
                      <DetailRow label="Address" value={application.address} />
                    </div>
                    {application.otherDetails && (
                      <div className="sm:col-span-2">
                        <DetailRow label="Other Details" value={application.otherDetails} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <p className="text-sm text-foreground font-medium mt-0.5">{value}</p>
    </div>
  );
}
