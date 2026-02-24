import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type AgentStatus = { #pending; #approved; #rejected };
  type ApplicationStatus = { #pending; #approved; #rejected };

  type OtpRecord = {
    code : Text;
    expiresAt : Int;
  };

  public type Agent = {
    id : Text;
    name : Text;
    mobile : Text;
    email : Text;
    passwordHash : Text;
    status : AgentStatus;
  };

  public type FarmerEKYCApplication = {
    acknowledgmentNumber : Text;
    agentId : Text;
    farmerName : Text;
    mobile : Text;
    address : Text;
    aadhaarNumber : Text;
    panNumber : Text;
    otherDetails : Text;
    documentReferences : [Text];
    status : ApplicationStatus;
    submittedAt : Int;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
    agentId : Text;
  };

  type ManagerSession = {
    token : Text;
    expiresAt : Int;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let agents = Map.empty<Text, Agent>();
  let applications = Map.empty<Text, FarmerEKYCApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let otpStore = Map.empty<Text, OtpRecord>();
  let otpCounter = Map.empty<Nat, Nat>();
  var managerSession : ?ManagerSession = null;

  let otpValidityPeriod : Int = 5 * 60 * 1000000000;
  let sessionValidityPeriod : Int = 60 * 60 * 1000000000;
  var managerEmail : Text = "sansubasu34@gmail.com";

  var agentCounter = 1;

  func generateToken() : Text {
    let randomPart = Int.abs(Time.now()) % 1_000_000_000_000;
    "token-" # randomPart.toText();
  };

  func generateAcknowledgmentNumber() : Text {
    let randomNum = 10_000_000_000_000 + Int.abs(Time.now()) % 10_000_000_000_000;
    randomNum.toText();
  };

  func compareApplicationsBySubmittedAt(a : FarmerEKYCApplication, b : FarmerEKYCApplication) : Order.Order {
    Int.compare(b.submittedAt, a.submittedAt);
  };

  // ── User profile functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Manager OTP authentication ──────────────────────────────────────────────
  // requestManagerOtp: open to anyone (validates email server-side, sends OTP to fixed email)
  public shared func requestManagerOtp(email : Text) : async () {
    if (email != managerEmail) {
      Runtime.trap("Unauthorized: This is not a valid manager email.");
    };
    // OTP is fixed at "123456" per spec; in production this would send an email
    let _otp = "123456";
  };

  // verifyManagerOtp: must be shared (update call) because it mutates managerSession
  // No caller auth required – the OTP itself is the credential
  public shared func verifyManagerOtp(email : Text, otp : Text) : async { #ok : Text; #err : Text } {
    if (email != managerEmail) {
      return #err("Unauthorized: This is not a valid manager email");
    };

    if (otp == "123456") {
      let token = generateToken();
      let newSession : ManagerSession = {
        token;
        expiresAt = Time.now() + sessionValidityPeriod;
      };
      managerSession := ?newSession;
      #ok(token);
    } else {
      #err("Incorrect One Time Password. Please try again.");
    };
  };

  // ── Validate manager session (admin only – exposes session token) ───────────
  public query ({ caller }) func getManagerSession() : async ?Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can retrieve the manager session");
    };
    switch (managerSession) {
      case (null) { null };
      case (?session) {
        if (Time.now() > session.expiresAt) {
          null;
        } else {
          ?session.token;
        };
      };
    };
  };

  // ── Agent registration (public – agents self-register, status starts pending) ─

  public shared func registerAgent(
    agentId : Text,
    name : Text,
    mobile : Text,
    email : Text,
    passwordHash : Text,
  ) : async () {
    // Public endpoint: no authentication required for self-registration
    let newAgent : Agent = {
      id = agentId;
      name;
      mobile;
      email;
      passwordHash;
      status = #pending : AgentStatus;
    };
    agents.add(agentId, newAgent);
  };

  // ── Admin-only createAgentByManager (bypasses approval, status = approved) ──

  public shared ({ caller }) func createAgentByManager(
    name : Text,
    mobile : Text,
    email : Text,
    passwordHash : ?Text,
  ) : async Agent {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create agents");
    };

    agentCounter += 1;
    let agentId = "AGENT" # agentCounter.toText();

    let agent : Agent = {
      id = agentId;
      name;
      mobile;
      email;
      passwordHash = switch (passwordHash) {
        case (null) { "defaultPassword" };
        case (?pw) { pw };
      };
      status = #approved : AgentStatus;
    };

    agents.add(agentId, agent);
    agent;
  };

  // ── Agent login by Agent ID + fixed OTP '696900' (public) ──────────────────

  public query func agentLogin(agentId : Text, otp : Text) : async { #ok : Agent; #err : Text } {
    switch (agents.get(agentId)) {
      case null { #err("Agent not found") };
      case (?agent) {
        switch (agent.status) {
          case (#pending) { #err("Account pending. Wait for approval.") };
          case (#rejected) { #err("Account rejected. Please contact administration.") };
          case (#approved) {
            if (otp != "696900") {
              #err("Incorrect One Time Password. Please try again.");
            } else {
              #ok(agent);
            };
          };
        };
      };
    };
  };

  // ── Agent login by phone number + stored password (public) ─────────────────

  public query func agentLoginWithPhone(phone : Text, password : Text) : async { #ok : Agent; #err : Text } {
    let agentsArray = agents.toArray();
    var foundAgent : ?Agent = null;

    for ((_, agent) in agentsArray.vals()) {
      if (agent.mobile == phone) {
        foundAgent := ?agent;
      };
    };

    switch (foundAgent) {
      case (null) { #err("Agent not found") };
      case (?agent) {
        switch (agent.status) {
          case (#pending) { #err("Account pending. Wait for approval.") };
          case (#rejected) { #err("Account rejected. Please contact administration.") };
          case (#approved) {
            if (password != agent.passwordHash) {
              #err("Incorrect Password. Please try again.");
            } else {
              #ok(agent);
            };
          };
        };
      };
    };
  };

  // ── Get agent by ID (authenticated users) ──────────────────────────────────

  public query ({ caller }) func getAgentById(agentId : Text) : async ?Agent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to look up an agent");
    };
    agents.get(agentId);
  };

  // ── List all agents (admin only) ────────────────────────────────────────────

  public query ({ caller }) func listAllAgents() : async [Agent] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all agents");
    };
    agents.values().toArray();
  };

  // ── Update agent status (admin only) ───────────────────────────────────────

  public shared ({ caller }) func updateAgentStatus(agentId : Text, newStatus : AgentStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update agent status");
    };
    switch (agents.get(agentId)) {
      case null { Runtime.trap("Agent not found") };
      case (?agent) {
        let updated : Agent = {
          id = agent.id;
          name = agent.name;
          mobile = agent.mobile;
          email = agent.email;
          passwordHash = agent.passwordHash;
          status = newStatus;
        };
        agents.add(agentId, updated);
      };
    };
  };

  // ── Submit farmer eKYC application (authenticated users / agents) ───────────

  public shared ({ caller }) func submitFarmerApplication(
    agentId : Text,
    farmerName : Text,
    mobile : Text,
    address : Text,
    aadhaarNumber : Text,
    panNumber : Text,
    otherDetails : Text,
    documentReferences : [Text],
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit farmer applications");
    };
    let ackNumber = generateAcknowledgmentNumber();
    let application : FarmerEKYCApplication = {
      acknowledgmentNumber = ackNumber;
      agentId;
      farmerName;
      mobile;
      address;
      aadhaarNumber;
      panNumber;
      otherDetails;
      documentReferences;
      status = #pending : ApplicationStatus;
      submittedAt = Time.now();
    };
    applications.add(ackNumber, application);
    ackNumber;
  };

  // ── Get application by acknowledgment number (authenticated users) ──────────

  public query ({ caller }) func getApplicationByAckNumber(ackNumber : Text) : async ?FarmerEKYCApplication {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to retrieve an application");
    };
    applications.get(ackNumber);
  };

  // ── List all applications (admin only) ─────────────────────────────────────

  public query ({ caller }) func listAllApplications() : async [FarmerEKYCApplication] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all applications");
    };
    let all = applications.values().toArray();
    all.sort(compareApplicationsBySubmittedAt);
  };

  // ── Update application status (admin only) ─────────────────────────────────

  public shared ({ caller }) func updateApplicationStatus(ackNumber : Text, newStatus : ApplicationStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update application status");
    };
    switch (applications.get(ackNumber)) {
      case null { Runtime.trap("Application not found") };
      case (?app) {
        let updated : FarmerEKYCApplication = {
          acknowledgmentNumber = app.acknowledgmentNumber;
          agentId = app.agentId;
          farmerName = app.farmerName;
          mobile = app.mobile;
          address = app.address;
          aadhaarNumber = app.aadhaarNumber;
          panNumber = app.panNumber;
          otherDetails = app.otherDetails;
          documentReferences = app.documentReferences;
          status = newStatus;
          submittedAt = app.submittedAt;
        };
        applications.add(ackNumber, updated);
      };
    };
  };
};
