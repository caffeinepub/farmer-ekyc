import React, { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CheckCircle, Copy, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Layout from '../components/Layout';

export default function AcknowledgmentScreen() {
  const navigate = useNavigate();
  const { ackNumber } = useParams({ from: '/agent/acknowledgment/$ackNumber' });
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ackNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout title="Application Submitted">
      <div className="max-w-lg mx-auto">
        <Card className="border-2 border-success shadow-card">
          <CardHeader className="bg-success rounded-t-lg text-center pb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-success-foreground/20 rounded-full p-4">
                <CheckCircle className="w-12 h-12 text-success-foreground" />
              </div>
            </div>
            <CardTitle className="text-success-foreground font-heading text-2xl">Application Submitted!</CardTitle>
            <CardDescription className="text-success-foreground/80 text-sm mt-1">
              The farmer eKYC application has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Acknowledgment Number */}
            <div className="bg-accent/10 border-2 border-accent rounded-xl p-5 text-center">
              <p className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-widest">Acknowledgment Number</p>
              <p className="text-3xl font-heading font-bold text-primary tracking-widest">{ackNumber}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800 text-sm font-medium">📋 Keep this number safe</p>
              <p className="text-amber-700 text-xs mt-1">Use this acknowledgment number to track the application status.</p>
            </div>

            <Button onClick={handleCopy} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2">
              <Copy className="w-4 h-4" />
              {copied ? '✓ Copied!' : 'Copy Acknowledgment Number'}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate({ to: '/agent/submit-ekyc' })}
                variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 gap-1.5 text-sm"
              >
                <FileText className="w-4 h-4" /> New Application
              </Button>
              <Button
                onClick={() => navigate({ to: '/agent/check-status' })}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 text-sm font-semibold"
              >
                <Search className="w-4 h-4" /> Check Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
