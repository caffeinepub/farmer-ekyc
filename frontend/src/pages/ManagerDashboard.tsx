import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Users, FileCheck, UserPlus, ClipboardCheck, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '../components/Layout';
import { useAgentListQuery, useApplicationListQuery, getStatusString } from '../hooks/useQueries';
import type { Agent, FarmerEKYCApplication } from '../backend';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { data: agentsRaw } = useAgentListQuery();
  const { data: applicationsRaw } = useApplicationListQuery();

  const agents = (agentsRaw as unknown as Agent[]) || [];
  const applications = (applicationsRaw as unknown as FarmerEKYCApplication[]) || [];

  const pendingAgents = agents.filter(a => getStatusString(a.status) === 'pending').length;
  const pendingApps = applications.filter(a => getStatusString(a.status) === 'pending').length;

  const stats = [
    { label: 'Total Agents', value: agents.length, icon: Users, color: 'bg-primary' },
    { label: 'Pending Agents', value: pendingAgents, icon: TrendingUp, color: 'bg-warning' },
    { label: 'Total Applications', value: applications.length, icon: FileCheck, color: 'bg-success' },
    { label: 'Pending Applications', value: pendingApps, icon: BarChart3, color: 'bg-accent' },
  ];

  const navCards = [
    {
      title: 'Agent Approval',
      description: 'Review and approve or reject pending agent registrations.',
      icon: Users,
      path: '/manager/agent-approval',
      borderColor: 'border-primary/40',
      headerBg: 'bg-primary/10',
      iconBg: 'bg-primary',
      btnClass: 'bg-primary hover:bg-primary/90 text-primary-foreground',
    },
    {
      title: 'Application Approval',
      description: 'Review and process pending farmer eKYC applications.',
      icon: ClipboardCheck,
      path: '/manager/farmer-approval',
      borderColor: 'border-success/40',
      headerBg: 'bg-success/10',
      iconBg: 'bg-success',
      btnClass: 'bg-success hover:bg-success/90 text-success-foreground',
    },
    {
      title: 'Create Agent Account',
      description: 'Directly create a pre-approved agent account for trusted agents.',
      icon: UserPlus,
      path: '/manager/create-agent',
      borderColor: 'border-accent/40',
      headerBg: 'bg-accent/10',
      iconBg: 'bg-accent',
      btnClass: 'bg-accent hover:bg-accent/90 text-accent-foreground',
    },
  ];

  return (
    <Layout title="Manager Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div>
          <h3 className="font-heading font-semibold text-foreground text-base mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-2 border-border shadow-card overflow-hidden">
                <CardContent className="p-0">
                  <div className={`${stat.color} px-4 py-3 flex items-center justify-between`}>
                    <span className="text-2xl font-heading font-bold text-white">{stat.value}</span>
                    <div className="bg-white/20 rounded-full p-1.5">
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-card">
                    <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div>
          <h3 className="font-heading font-semibold text-foreground text-base mb-3 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Management Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {navCards.map((card) => (
              <Card
                key={card.title}
                className={`border-2 ${card.borderColor} hover:shadow-card-hover transition-all cursor-pointer group`}
                onClick={() => navigate({ to: card.path as any })}
              >
                <CardContent className="p-0">
                  <div className={`${card.headerBg} rounded-t-lg px-5 py-4 flex items-center gap-3 border-b ${card.borderColor}`}>
                    <div className={`${card.iconBg} rounded-xl p-2.5 shadow`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground text-sm">{card.title}</h4>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                    <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${card.btnClass} transition-colors`}>
                      Open →
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
