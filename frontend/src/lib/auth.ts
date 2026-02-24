// Session management utilities for agents and managers

export interface AgentSession {
  agentId: string;
  agentName: string;
  mobile: string;
  email: string;
}

export interface ManagerSessionData {
  token: string;
  email: string;
}

const AGENT_SESSION_KEY = 'farmer_ekyc_agent_session';
const MANAGER_SESSION_KEY = 'farmer_ekyc_manager_session';

export function saveAgentSession(session: AgentSession): void {
  sessionStorage.setItem(AGENT_SESSION_KEY, JSON.stringify(session));
}

export function getAgentSession(): AgentSession | null {
  try {
    const raw = sessionStorage.getItem(AGENT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AgentSession;
  } catch {
    return null;
  }
}

export function clearAgentSession(): void {
  sessionStorage.removeItem(AGENT_SESSION_KEY);
}

export function saveManagerSession(session: ManagerSessionData): void {
  sessionStorage.setItem(MANAGER_SESSION_KEY, JSON.stringify(session));
}

export function getManagerSession(): ManagerSessionData | null {
  try {
    const raw = sessionStorage.getItem(MANAGER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ManagerSessionData;
  } catch {
    return null;
  }
}

export function clearManagerSession(): void {
  sessionStorage.removeItem(MANAGER_SESSION_KEY);
}

export function hashPassword(password: string): string {
  // Simple hash for demo purposes - in production use proper crypto
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function generateAgentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AID${timestamp}${random}`;
}
