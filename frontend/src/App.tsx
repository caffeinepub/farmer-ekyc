import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import AgentSignup from './pages/AgentSignup';
import AgentLogin from './pages/AgentLogin';
import AgentDashboard from './pages/AgentDashboard';
import SubmitFarmerEKYC from './pages/SubmitFarmerEKYC';
import AcknowledgmentScreen from './pages/AcknowledgmentScreen';
import CheckApplicationStatus from './pages/CheckApplicationStatus';
import ManagerLogin from './pages/ManagerLogin';
import ManagerDashboard from './pages/ManagerDashboard';
import AgentApproval from './pages/AgentApproval';
import FarmerApplicationApproval from './pages/FarmerApplicationApproval';
import CreateAgentAccount from './pages/CreateAgentAccount';
import { getAgentSession, getManagerSession } from './lib/auth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const agentSession = getAgentSession();
    const managerSession = getManagerSession();
    if (agentSession) throw redirect({ to: '/agent/dashboard' });
    if (managerSession) throw redirect({ to: '/manager/dashboard' });
    throw redirect({ to: '/agent-login' });
  },
  component: () => null,
});

const agentSignupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-signup',
  component: AgentSignup,
});

const agentLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent-login',
  component: AgentLogin,
});

const agentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent/dashboard',
  beforeLoad: () => {
    const session = getAgentSession();
    if (!session) throw redirect({ to: '/agent-login' });
  },
  component: AgentDashboard,
});

const submitEkycRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent/submit-ekyc',
  beforeLoad: () => {
    const session = getAgentSession();
    if (!session) throw redirect({ to: '/agent-login' });
  },
  component: SubmitFarmerEKYC,
});

const acknowledgmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent/acknowledgment/$ackNumber',
  beforeLoad: () => {
    const session = getAgentSession();
    if (!session) throw redirect({ to: '/agent-login' });
  },
  component: AcknowledgmentScreen,
});

const checkStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agent/check-status',
  beforeLoad: () => {
    const session = getAgentSession();
    if (!session) throw redirect({ to: '/agent-login' });
  },
  component: CheckApplicationStatus,
});

const managerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager-login',
  component: ManagerLogin,
});

const managerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/dashboard',
  beforeLoad: () => {
    const session = getManagerSession();
    if (!session) throw redirect({ to: '/manager-login' });
  },
  component: ManagerDashboard,
});

const agentApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/agent-approval',
  beforeLoad: () => {
    const session = getManagerSession();
    if (!session) throw redirect({ to: '/manager-login' });
  },
  component: AgentApproval,
});

const farmerApprovalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/farmer-approval',
  beforeLoad: () => {
    const session = getManagerSession();
    if (!session) throw redirect({ to: '/manager-login' });
  },
  component: FarmerApplicationApproval,
});

const createAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager/create-agent',
  beforeLoad: () => {
    const session = getManagerSession();
    if (!session) throw redirect({ to: '/manager-login' });
  },
  component: CreateAgentAccount,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  agentSignupRoute,
  agentLoginRoute,
  agentDashboardRoute,
  submitEkycRoute,
  acknowledgmentRoute,
  checkStatusRoute,
  managerLoginRoute,
  managerDashboardRoute,
  agentApprovalRoute,
  farmerApprovalRoute,
  createAgentRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
