import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Agent as BackendAgent, FarmerEKYCApplication } from '../backend';
import { ApplicationStatus } from '../backend';

export { ApplicationStatus };
export type { FarmerEKYCApplication };
export type Agent = BackendAgent;

// Re-export AgentStatus values as constants
export const AgentStatus = {
  pending: 'pending' as const,
  approved: 'approved' as const,
  rejected: 'rejected' as const,
};

export type AgentStatusType = 'pending' | 'approved' | 'rejected';
export type ApplicationStatusType = 'pending' | 'approved' | 'rejected';

export function getStatusString(status: unknown): string {
  if (typeof status === 'object' && status !== null) {
    if ('__kind__' in status) {
      return (status as { __kind__: string }).__kind__;
    }
    const keys = Object.keys(status);
    if (keys.length > 0) return keys[0];
  }
  if (typeof status === 'string') return status;
  return 'unknown';
}

// ── Agent Queries ──────────────────────────────────────────────────────────────

export function useAgentListQuery() {
  const { actor, isFetching } = useActor();

  return useQuery<BackendAgent[]>({
    queryKey: ['agents'],
    queryFn: async (): Promise<BackendAgent[]> => {
      if (!actor) return [];
      const result = await actor.listAllAgents();
      return result as unknown as BackendAgent[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplicationListQuery() {
  const { actor, isFetching } = useActor();

  return useQuery<FarmerEKYCApplication[]>({
    queryKey: ['applications'],
    queryFn: async (): Promise<FarmerEKYCApplication[]> => {
      if (!actor) return [];
      const result = await actor.listAllApplications();
      return result as unknown as FarmerEKYCApplication[];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetApplicationByAckNumberQuery(ackNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<FarmerEKYCApplication | null>({
    queryKey: ['application', ackNumber],
    queryFn: async (): Promise<FarmerEKYCApplication | null> => {
      if (!actor || !ackNumber) return null;
      const result = await actor.getApplicationByAckNumber(ackNumber);
      return (result ?? null) as unknown as FarmerEKYCApplication | null;
    },
    enabled: !!actor && !isFetching && !!ackNumber,
  });
}

// ── Agent Mutations ────────────────────────────────────────────────────────────

export function useRegisterAgentMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      name: string;
      mobile: string;
      email: string;
      passwordHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.registerAgent(
        params.agentId,
        params.name,
        params.mobile,
        params.email,
        params.passwordHash
      );
      return params.agentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useAgentLoginMutation() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { agentId: string; otp: string }): Promise<BackendAgent> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.agentLogin(params.agentId, params.otp);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok as unknown as BackendAgent;
    },
  });
}

export function useAgentLoginWithPhoneMutation() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { phone: string; password: string }): Promise<BackendAgent> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.agentLoginWithPhone(params.phone, params.password);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok as unknown as BackendAgent;
    },
  });
}

export function useCreateAgentByManagerMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      mobile: string;
      email: string;
      passwordHash: string | null;
    }): Promise<BackendAgent> => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createAgentByManager(
        params.name,
        params.mobile,
        params.email,
        params.passwordHash
      );
      return result as unknown as BackendAgent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgentStatusMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { agentId: string; status: AgentStatusType }) => {
      if (!actor) throw new Error('Actor not available');
      const statusVariant =
        params.status === 'approved'
          ? { approved: null }
          : params.status === 'rejected'
          ? { rejected: null }
          : { pending: null };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await actor.updateAgentStatus(params.agentId, statusVariant as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateApplicationStatusMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { ackNumber: string; status: ApplicationStatusType }) => {
      if (!actor) throw new Error('Actor not available');
      const statusVariant =
        params.status === 'approved'
          ? ApplicationStatus.approved
          : params.status === 'rejected'
          ? ApplicationStatus.rejected
          : ApplicationStatus.pending;
      await actor.updateApplicationStatus(params.ackNumber, statusVariant);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useSubmitFarmerApplicationMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      agentId: string;
      farmerName: string;
      mobile: string;
      address: string;
      aadhaarNumber: string;
      panNumber: string;
      otherDetails: string;
      documentReferences: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      const ackNumber = await actor.submitFarmerApplication(
        params.agentId,
        params.farmerName,
        params.mobile,
        params.address,
        params.aadhaarNumber,
        params.panNumber,
        params.otherDetails,
        params.documentReferences
      );
      return ackNumber;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

export function useRequestManagerOtpMutation() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (email: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.requestManagerOtp(email);
    },
  });
}

export function useVerifyManagerOtpMutation() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { email: string; otp: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.verifyManagerOtp(params.email, params.otp);
      if (result.__kind__ === 'err') {
        throw new Error(result.err);
      }
      return result.ok;
    },
  });
}
