import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { LogIn, Phone, Hash, Leaf, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAgentLoginMutation, useAgentLoginWithPhoneMutation } from '../hooks/useQueries';
import { saveAgentSession, hashPassword } from '../lib/auth';
import type { Agent } from '../backend';

export default function AgentLogin() {
  const navigate = useNavigate();
  const [agentId, setAgentId] = useState('');
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useAgentLoginMutation();
  const phoneLoginMutation = useAgentLoginWithPhoneMutation();

  const handleAgentIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const agent = await loginMutation.mutateAsync({ agentId, otp });
      const a = agent as unknown as Agent;
      saveAgentSession({ agentId: a.id, agentName: a.name, mobile: a.mobile, email: a.email });
      navigate({ to: '/agent/dashboard' });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const hashedPassword = hashPassword(password);
      const agent = await phoneLoginMutation.mutateAsync({ phone, password: hashedPassword });
      const a = agent as unknown as Agent;
      saveAgentSession({ agentId: a.id, agentName: a.name, mobile: a.mobile, email: a.email });
      navigate({ to: '/agent/dashboard' });
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
                  <LogIn className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-primary-foreground font-heading text-xl">Agent Login</CardTitle>
                  <CardDescription className="text-primary-foreground/70 text-sm">Sign in to your agent account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              {error && (
                <div className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}
              <Tabs defaultValue="agentId">
                <TabsList className="w-full mb-5 bg-muted border border-border">
                  <TabsTrigger value="agentId" className="flex-1 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                    <Hash className="w-4 h-4" /> Agent ID
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex-1 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
                    <Phone className="w-4 h-4" /> Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="agentId">
                  <form onSubmit={handleAgentIdLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="agentId" className="text-foreground font-semibold text-sm">Agent ID</Label>
                      <Input
                        id="agentId"
                        value={agentId}
                        onChange={e => setAgentId(e.target.value)}
                        placeholder="e.g. AID-XXXXXXXX"
                        required
                        className="border-border focus:border-primary focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="otp" className="text-foreground font-semibold text-sm">OTP</Label>
                      <Input
                        id="otp"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        required
                        className="border-border focus:border-primary focus:ring-primary/30"
                      />
                      <p className="text-xs text-muted-foreground">Use OTP: <span className="font-bold text-accent-foreground bg-accent/20 px-1.5 py-0.5 rounded">696900</span></p>
                    </div>
                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold"
                    >
                      {loginMutation.isPending ? (
                        <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Logging in...</span>
                      ) : (
                        <span className="flex items-center gap-2"><LogIn className="w-4 h-4" />Login with Agent ID</span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone">
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-foreground font-semibold text-sm">Phone Number</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                        className="border-border focus:border-primary focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-foreground font-semibold text-sm">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="border-border focus:border-primary focus:ring-primary/30"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={phoneLoginMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold"
                    >
                      {phoneLoginMutation.isPending ? (
                        <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />Logging in...</span>
                      ) : (
                        <span className="flex items-center gap-2"><Phone className="w-4 h-4" />Login with Phone</span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-5 pt-4 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button onClick={() => navigate({ to: '/agent-signup' })} className="text-primary font-semibold hover:underline">
                    Register here
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
