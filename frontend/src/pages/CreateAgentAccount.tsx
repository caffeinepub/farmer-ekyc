import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UserPlus, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '../components/Layout';
import { useCreateAgentByManagerMutation } from '../hooks/useQueries';
import { hashPassword } from '../lib/auth';
import type { Agent } from '../backend';

export default function CreateAgentAccount() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [createdAgent, setCreatedAgent] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const createMutation = useCreateAgentByManagerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const passwordHash = form.password ? hashPassword(form.password) : null;
      const result = await createMutation.mutateAsync({
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        passwordHash,
      });
      const agent = result as unknown as Agent;
      setCreatedAgent({ id: agent.id, name: agent.name });
    } catch (err: any) {
      setError(err.message || 'Failed to create agent account');
    }
  };

  const handleCopy = () => {
    if (createdAgent) {
      navigator.clipboard.writeText(createdAgent.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (createdAgent) {
    return (
      <Layout title="Create Agent Account">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-success shadow-card">
            <CardHeader className="bg-success rounded-t-lg text-center pb-5">
              <div className="flex justify-center mb-3">
                <div className="bg-success-foreground/20 rounded-full p-3">
                  <CheckCircle className="w-10 h-10 text-success-foreground" />
                </div>
              </div>
              <CardTitle className="text-success-foreground font-heading text-xl">Agent Account Created!</CardTitle>
              <CardDescription className="text-success-foreground/80">Account is pre-approved and ready to use</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="bg-accent/10 border-2 border-accent rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Agent Name</p>
                <p className="text-lg font-heading font-bold text-foreground">{createdAgent.name}</p>
              </div>
              <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Agent ID</p>
                <p className="text-2xl font-heading font-bold text-primary tracking-widest">{createdAgent.id}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm font-medium">📋 Share with the agent</p>
                <p className="text-amber-700 text-xs mt-1">The agent can use this ID with OTP 696900 to log in immediately.</p>
              </div>
              <Button onClick={handleCopy} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                <Copy className="w-4 h-4" />
                {copied ? '✓ Copied!' : 'Copy Agent ID'}
              </Button>
              <Button
                onClick={() => { setCreatedAgent(null); setForm({ name: '', mobile: '', email: '', password: '' }); }}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Create Another Agent
              </Button>
              <Button variant="ghost" onClick={() => navigate({ to: '/manager/dashboard' })} className="w-full text-muted-foreground hover:text-primary">
                ← Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Agent Account">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate({ to: '/manager/dashboard' })} className="gap-1 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h2 className="font-heading font-bold text-xl text-foreground">Create Agent Account</h2>
        </div>

        <Card className="border-2 border-primary/30 shadow-card">
          <CardHeader className="bg-primary rounded-t-lg pb-5">
            <div className="flex items-center gap-3">
              <div className="bg-accent rounded-full p-2">
                <UserPlus className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-primary-foreground font-heading text-xl">New Agent Account</CardTitle>
                <CardDescription className="text-primary-foreground/70 text-sm">Create a pre-approved agent account</CardDescription>
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
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-foreground font-semibold text-sm">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Agent's full name"
                  required
                  className="border-border focus:border-primary focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="text-foreground font-semibold text-sm">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={form.mobile}
                  onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                  placeholder="10-digit mobile number"
                  required
                  className="border-border focus:border-primary focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground font-semibold text-sm">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="agent@example.com"
                  required
                  className="border-border focus:border-primary focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground font-semibold text-sm">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Leave blank for default password"
                  className="border-border focus:border-primary focus:ring-primary/30"
                />
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-2.5 mt-2"
              >
                {createMutation.isPending ? (
                  <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Creating...</span>
                ) : (
                  <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Create Agent Account</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
