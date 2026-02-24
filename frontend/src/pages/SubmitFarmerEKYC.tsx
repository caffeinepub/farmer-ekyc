import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FileText, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '../components/Layout';
import { useSubmitFarmerApplicationMutation } from '../hooks/useQueries';
import { getAgentSession } from '../lib/auth';

export default function SubmitFarmerEKYC() {
  const navigate = useNavigate();
  const session = getAgentSession();
  const submitMutation = useSubmitFarmerApplicationMutation();

  const [form, setForm] = useState({
    farmerName: '',
    mobile: '',
    address: '',
    aadhaarNumber: '',
    panNumber: '',
    otherDetails: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!session) {
      setError('Session expired. Please login again.');
      return;
    }
    try {
      const ackNumber = await submitMutation.mutateAsync({
        agentId: session.agentId,
        farmerName: form.farmerName,
        mobile: form.mobile,
        address: form.address,
        aadhaarNumber: form.aadhaarNumber,
        panNumber: form.panNumber,
        otherDetails: form.otherDetails,
        documentReferences: [],
      });
      navigate({ to: '/agent/acknowledgment/$ackNumber', params: { ackNumber } });
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    }
  };

  const field = (id: keyof typeof form, label: string, placeholder: string, required = true) => (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-foreground font-semibold text-sm">{label}{required && ' *'}</Label>
      <Input
        id={id}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        placeholder={placeholder}
        required={required}
        className="border-border focus:border-primary focus:ring-primary/30"
      />
    </div>
  );

  return (
    <Layout title="Submit Farmer eKYC">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate({ to: '/agent/dashboard' })} className="gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading font-bold text-xl text-foreground">Submit Farmer eKYC</h2>
        </div>

        <Card className="border-2 border-primary/30 shadow-card">
          <CardHeader className="bg-primary rounded-t-lg pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-full p-2">
                <FileText className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-primary-foreground font-heading text-lg">Farmer KYC Application</CardTitle>
                <CardDescription className="text-primary-foreground/70 text-sm">
                  Agent: <span className="font-semibold">{session?.agentId}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('farmerName', 'Farmer Full Name', "Enter farmer's full name")}
                {field('mobile', 'Mobile Number', '10-digit mobile number')}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-foreground font-semibold text-sm">Address *</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Full residential address"
                  required
                  rows={3}
                  className="border-border focus:border-primary focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('aadhaarNumber', 'Aadhaar Number', '12-digit Aadhaar number')}
                {field('panNumber', 'PAN Number', 'e.g. ABCDE1234F', false)}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otherDetails" className="text-foreground font-semibold text-sm">Other Details</Label>
                <Textarea
                  id="otherDetails"
                  value={form.otherDetails}
                  onChange={e => setForm(f => ({ ...f, otherDetails: e.target.value }))}
                  placeholder="Any additional information..."
                  rows={2}
                  className="border-border focus:border-primary focus:ring-primary/30 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-2.5"
              >
                {submitMutation.isPending ? (
                  <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Submitting...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" />Submit eKYC Application</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
