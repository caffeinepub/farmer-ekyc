import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Mail, KeyRound, Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRequestManagerOtpMutation, useVerifyManagerOtpMutation } from '../hooks/useQueries';
import { saveManagerSession } from '../lib/auth';

export default function ManagerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');

  const requestOtpMutation = useRequestManagerOtpMutation();
  const verifyOtpMutation = useVerifyManagerOtpMutation();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await requestOtpMutation.mutateAsync(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = await verifyOtpMutation.mutateAsync({ email, otp });
      saveManagerSession({ token, email });
      navigate({ to: '/manager/dashboard' });
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    }
  };

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
            onClick={() => navigate({ to: '/' })}
            className="mb-4 text-muted-foreground hover:text-primary gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <Card className="border-2 border-primary/30 shadow-card">
            <CardHeader className="bg-primary rounded-t-lg pb-5">
              <div className="flex items-center gap-3">
                <div className="bg-accent rounded-full p-2">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-primary-foreground font-heading text-xl">Manager Login</CardTitle>
                  <CardDescription className="text-primary-foreground/70 text-sm">
                    {step === 'email' ? 'Enter your email to receive OTP' : 'Enter the OTP sent to your email'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <div className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              {step === 'email' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-foreground font-semibold text-sm flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-primary" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="manager@example.com"
                      required
                      className="border-border focus:border-primary focus:ring-primary/30"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={requestOtpMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold"
                  >
                    {requestOtpMutation.isPending ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Sending OTP...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4" />Request OTP</span>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-foreground">
                    OTP sent to <span className="font-semibold text-primary">{email}</span>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp" className="text-foreground font-semibold text-sm flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-primary" /> One-Time Password
                    </Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      required
                      className="border-border focus:border-primary focus:ring-primary/30 text-center text-lg tracking-widest font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Use OTP: <span className="font-bold text-accent-foreground bg-accent/20 px-1.5 py-0.5 rounded">123456</span></p>
                  </div>
                  <Button
                    type="submit"
                    disabled={verifyOtpMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold"
                  >
                    {verifyOtpMutation.isPending ? (
                      <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Verifying...</span>
                    ) : (
                      <span className="flex items-center gap-2"><KeyRound className="w-4 h-4" />Verify OTP</span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                    className="w-full text-muted-foreground hover:text-primary"
                  >
                    ← Change Email
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
