import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Agent {
    id: string;
    status: AgentStatus;
    name: string;
    email: string;
    passwordHash: string;
    mobile: string;
}
export interface FarmerEKYCApplication {
    status: ApplicationStatus;
    documentReferences: Array<string>;
    otherDetails: string;
    submittedAt: bigint;
    agentId: string;
    address: string;
    panNumber: string;
    mobile: string;
    aadhaarNumber: string;
    acknowledgmentNumber: string;
    farmerName: string;
}
export interface UserProfile {
    name: string;
    role: string;
    agentId: string;
}
export enum ApplicationStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    agentLogin(agentId: string, otp: string): Promise<{
        __kind__: "ok";
        ok: Agent;
    } | {
        __kind__: "err";
        err: string;
    }>;
    agentLoginWithPhone(phone: string, password: string): Promise<{
        __kind__: "ok";
        ok: Agent;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAgentByManager(name: string, mobile: string, email: string, passwordHash: string | null): Promise<Agent>;
    getAgentById(agentId: string): Promise<Agent | null>;
    getApplicationByAckNumber(ackNumber: string): Promise<FarmerEKYCApplication | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getManagerSession(): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllAgents(): Promise<Array<Agent>>;
    listAllApplications(): Promise<Array<FarmerEKYCApplication>>;
    registerAgent(agentId: string, name: string, mobile: string, email: string, passwordHash: string): Promise<void>;
    requestManagerOtp(email: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitFarmerApplication(agentId: string, farmerName: string, mobile: string, address: string, aadhaarNumber: string, panNumber: string, otherDetails: string, documentReferences: Array<string>): Promise<string>;
    updateAgentStatus(agentId: string, newStatus: AgentStatus): Promise<void>;
    updateApplicationStatus(ackNumber: string, newStatus: ApplicationStatus): Promise<void>;
    verifyManagerOtp(email: string, otp: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
