import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { UserPlus, Copy, CheckCircle, Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRegisterAgentMutation } from '../hooks/useQueries';
import { generateAgentId, hashPassword } from '../lib/auth';

export default function AgentSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [copied, setCopied] = useState(false);
  const registerMutation = useRegisterAgentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const agentId = generateAgentId();
      const passwordHash = hashPassword(form.password);
      await registerMutation.mutateAsync({
        agentId,
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        passwordHash,
      });
      setGeneratedId(agentId);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-success shadow-card">
            <CardHeader className="bg-success rounded-t-lg text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="bg-success-foreground/20 rounded-full p-3">
                  <CheckCircle className="w-10 h-10 text-success-foreground" />
                </div>
              </div>
              <CardTitle className="text-success-foreground font-heading text-xl">Registration Successful!</CardTitle>
              <CardDescription className="text-success-foreground/80">Your agent account has been created</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="bg-accent/10 border-2 border-accent rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Your Agent ID</p>
                <p className="text-2xl font-heading font-bold text-primary tracking-widest">{generatedId}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm font-medium">⚠️ Save this Agent ID</p>
                <p className="text-amber-700 text-xs mt-1">You'll need this to log in. Your account is pending manager approval.</p>
              </div>
              <Button onClick={handleCopy} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Agent ID'}
              </Button>
              <Button onClick={() => navigate({ to: '/agent-login' })} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Colorful header */}
      <header className="bg-primary shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-accent rounded-full p-2">
            <Leaf className="w-5 h-5 text-accent-foreground" />
          </div>
          <span className="font-heading font-bold text-lg text-primary-foreground">Farmer eKYC</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/agent-login' })}
            className="mb-4 text-muted-foreground hover:text-primary gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Button>

          <Card className="border-2 border-primary/30 shadow-card">
            <CardHeader className="bg-primary rounded-t-lg pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <UserPlus className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-primary-foreground font-heading text-xl">Agent Registration</CardTitle>
                  <CardDescription className="text-primary-foreground/70 text-sm">Create your agent account</CardDescription>
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
                    placeholder="Enter your full name"
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
                    placeholder="your@email.com"
                    required
                    className="border-border focus:border-primary focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-foreground font-semibold text-sm">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Minimum 6 characters"
                    required
                    className="border-border focus:border-primary focus:ring-primary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-foreground font-semibold text-sm">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Re-enter your password"
                    required
                    className="border-border focus:border-primary focus:ring-primary/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-2.5 mt-2"
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Registering...</span>
                  ) : (
                    <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Register Agent</span>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate({ to: '/agent-login' })} className="text-primary font-semibold hover:underline">
                    Login here
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
