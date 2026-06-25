import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

const rootEnvPath = resolve(process.cwd(), ".env");
if (existsSync(rootEnvPath)) {
  loadEnvFile(rootEnvPath);
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "voicenexus";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required. Run this with the same MongoDB URI used by the API/AI Brain.");
  process.exit(1);
}

const ids = {
  org: oid("650000000000000000000001"),
  owner: oid("650000000000000000000101"),
  manager: oid("650000000000000000000102"),
  agent: oid("650000000000000000000103"),
  phone: oid("650000000000000000000201"),
  leads: [
    oid("650000000000000000001001"),
    oid("650000000000000000001002"),
    oid("650000000000000000001003"),
    oid("650000000000000000001004"),
    oid("650000000000000000001005"),
    oid("650000000000000000001006"),
  ],
  queues: {
    sales: oid("650000000000000000003001"),
    success: oid("650000000000000000003002"),
  },
  personas: {
    sales: oid("650000000000000000004001"),
    support: oid("650000000000000000004002"),
  },
  humanAgents: {
    maya: oid("650000000000000000004101"),
    omar: oid("650000000000000000004102"),
  },
  reportTemplate: oid("650000000000000000008001"),
};

const now = new Date();
const demoTag = { demoSeed: "voicenexus-demo-v1" };

await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME });
const db = mongoose.connection.db;

try {
  const passwordHash = await bcrypt.hash("VoiceNexusDemo!2026", 12);
  await upsertMany("users", [
    {
      _id: ids.owner,
      email: "owner@acme-growth.example",
      firstName: "Avery",
      lastName: "Morgan",
      passwordHash,
      platformRole: "SUPER_ADMIN",
      status: "ACTIVE",
      lastLoginAt: daysAgo(1),
      ...timestamps(45),
    },
    {
      _id: ids.manager,
      email: "sales.manager@acme-growth.example",
      firstName: "Priya",
      lastName: "Shah",
      passwordHash,
      platformRole: null,
      status: "ACTIVE",
      lastLoginAt: daysAgo(2),
      ...timestamps(44),
    },
    {
      _id: ids.agent,
      email: "voice.agent@acme-growth.example",
      firstName: "Jordan",
      lastName: "Lee",
      passwordHash,
      platformRole: null,
      status: "ACTIVE",
      lastLoginAt: daysAgo(0.5),
      ...timestamps(43),
    },
  ]);

  await upsertMany("organizations", [
    {
      _id: ids.org,
      name: "Acme Growth Cloud",
      slug: "acme-growth-cloud",
      status: "ACTIVE",
      timezone: "America/New_York",
      createdBy: ids.owner,
      ...timestamps(45),
    },
  ]);

  await upsertMany("organizationmembers", [
    member(ids.owner, "OWNER", ids.owner),
    member(ids.manager, "MANAGER", ids.owner),
    member(ids.agent, "AGENT", ids.manager),
  ]);

  await upsertMany("phonenumbers", [
    {
      _id: ids.phone,
      organizationId: ids.org,
      provider: "TWILIO",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+15555550100",
      label: "Primary AI sales line",
      providerSid: "PN_DEMO_PRIMARY",
      status: "ACTIVE",
      capabilities: { voice: true, sms: true, whatsapp: true },
      ...timestamps(42),
    },
  ]);

  const leads = [
    lead(0, "Nora", "Patel", "nora.patel@northstar.example", "+14155550101", "Northstar Logistics", "Website", "INTERESTED", 84),
    lead(1, "Ethan", "Brooks", "ethan.brooks@riverbend.example", "+14155550102", "Riverbend Health", "LinkedIn", "QUALIFIED", 78),
    lead(2, "Camila", "Rojas", "camila.rojas@atlasretail.example", "+14155550103", "Atlas Retail Group", "Partner", "FOLLOW_UP", 67),
    lead(3, "Marcus", "Chen", "marcus.chen@stackforge.example", "+14155550104", "StackForge Labs", "Outbound", "CONTACTED", 59),
    lead(4, "Sofia", "Nguyen", "sofia.nguyen@brightpath.example", "+14155550105", "BrightPath Solar", "Webinar", "WON", 92),
    lead(5, "Liam", "O'Connor", "liam.oconnor@harborfin.example", "+14155550106", "HarborFin", "Referral", "NEW", 42),
  ];
  await upsertMany("leads", leads);

  await upsertMany("contacts", leads.map((item, index) => ({
    _id: oid(`65000000000000000000200${index + 1}`),
    organizationId: ids.org,
    leadId: item._id,
    email: item.email,
    phone: item.phone,
    preferredLanguage: "en",
    timezone: index === 2 ? "America/Los_Angeles" : "America/New_York",
    customerType: item.status === "WON" ? "CUSTOMER" : "LEAD",
    ...timestamps(35 - index),
  })));

  await upsertMany("customermemories", leads.map((item, index) => ({
    _id: oid(`65000000000000000000500${index + 1}`),
    organizationId: ids.org,
    leadId: item._id,
    summary: memorySummary(item.company, index),
    relationshipScore: [88, 81, 73, 61, 94, 52][index],
    lastInteractionAt: daysAgo(index + 1),
    memoryTags: [],
    ...timestamps(25 - index),
  })));

  await upsertMany("conversationmemories", leads.flatMap((item, index) => [
    {
      _id: oid(`6500000000000000000060${index + 1}1`),
      organizationId: ids.org,
      leadId: item._id,
      source: "CALL",
      content: `${item.firstName} asked about implementation effort, pricing, and whether VoiceNexus can sync call notes back to the CRM.`,
      sentiment: index === 3 ? "MIXED" : "POSITIVE",
      importance: index < 2 ? 5 : 4,
      createdAt: daysAgo(index + 2),
    },
    {
      _id: oid(`6500000000000000000060${index + 1}2`),
      organizationId: ids.org,
      leadId: item._id,
      source: "WHATSAPP",
      content: `${item.company} prefers concise follow-up messages with a link to the integration checklist.`,
      sentiment: "NEUTRAL",
      importance: 3,
      createdAt: daysAgo(index + 1),
    },
  ]));

  const calls = leads.map((item, index) => call(item, index));
  await upsertMany("callsessions", calls);
  await upsertMany("callevents", calls.flatMap((item, index) => callEvents(item, index)));

  await upsertMany("aiconversations", calls.map((item, index) => ({
    _id: oid(`65000000000000000000a00${index + 1}`),
    organizationId: ids.org,
    leadId: item.leadId,
    callId: item._id,
    status: index < 4 ? "ENDED" : "ACTIVE",
    currentIntent: index < 2 ? "pricing_and_demo" : "qualification",
    sentiment: index === 3 ? "MIXED" : "POSITIVE",
    leadScore: leads[index].score,
    summary: `AI discussed ${leads[index].company}'s sales workflow, captured next steps, and identified CRM sync as a decision factor.`,
    outcome: index === 4 ? "qualified_opportunity_won" : "follow_up_required",
    nextActions: ["Send implementation checklist", "Schedule technical discovery"],
    actionItems: ["Confirm CRM owner", "Share security one-pager"],
    customerConcerns: ["Migration effort", "Voice latency", "Data retention"],
    opportunities: ["Annual AI calling rollout", "WhatsApp automation expansion"],
    state: {
      detectedLanguage: "en",
      qualificationProgress: { budget: index < 4, urgency: true, authority: index !== 5 },
      collectedFacts: { seats: String(15 + index * 8), crm: index % 2 ? "HubSpot" : "Salesforce" },
      lastResponse: "I can help you compare rollout options and send a clear implementation plan after this call.",
    },
    startedAt: daysAgo(index + 1),
    endedAt: index < 4 ? hoursAgo(index + 4) : null,
    ...timestamps(index + 1),
  })));

  await upsertMany("aimessages", calls.flatMap((item, index) => [
    {
      _id: oid(`65000000000000000000b0${index + 1}1`),
      conversationId: oid(`65000000000000000000a00${index + 1}`),
      role: "user",
      content: "We need to understand pricing, CRM sync, and whether the AI can handle follow-up questions live.",
      tokens: 22,
      timestamp: daysAgo(index + 1),
    },
    {
      _id: oid(`65000000000000000000b0${index + 1}2`),
      conversationId: oid(`65000000000000000000a00${index + 1}`),
      role: "assistant",
      content: "VoiceNexus can qualify the lead, stream transcripts, generate live responses, update memory, and sync call outcomes back into your CRM workflow.",
      tokens: 31,
      timestamp: hoursAgo(index + 20),
    },
  ]));

  await upsertMany("callruntimesessions", calls.map((item, index) => ({
    _id: `runtime-demo-${index + 1}`,
    id: `runtime-demo-${index + 1}`,
    organizationId: ids.org.toString(),
    conversationId: item._id.toString(),
    callSid: `CA_DEMO_${String(index + 1).padStart(6, "0")}`,
    direction: item.direction,
    status: index < 4 ? "COMPLETED" : "ACTIVE",
    provider: index % 2 === 0 ? "groq" : "openai",
    model: index % 2 === 0 ? "llama-3.1-8b-instant" : "gpt-4o-mini",
    startedAt: item.startedAt,
    updatedAt: hoursAgo(index + 1),
    completedAt: index < 4 ? item.endedAt : null,
    metadata: {
      ...demoTag,
      apiCallSessionId: item._id.toString(),
      leadId: item.leadId.toString(),
      memoryInitialized: true,
      crmInitialized: true,
      analyticsTrackingInitialized: true,
    },
  })));

  await upsertMany("agentpersonas", [
    {
      _id: ids.personas.sales,
      organizationId: ids.org,
      name: "Revenue Concierge",
      role: "SALES_AGENT",
      systemPrompt: "Qualify SaaS buyers, handle pricing questions, and guide the caller to a useful next step.",
      tone: "consultative, concise, confident",
      goals: ["Qualify budget, urgency, authority", "Book a technical discovery", "Capture CRM-ready notes"],
      constraints: ["Do not invent pricing", "Escalate security or legal concerns"],
      isDefault: true,
      ...timestamps(30),
    },
    {
      _id: ids.personas.support,
      organizationId: ids.org,
      name: "Customer Success Triage",
      role: "SUPPORT_AGENT",
      systemPrompt: "Resolve implementation questions and route urgent customer issues to a human agent.",
      tone: "calm, precise, helpful",
      goals: ["Reduce wait time", "Summarize support context", "Escalate when confidence is low"],
      constraints: ["Never promise unsupported integrations"],
      isDefault: false,
      ...timestamps(29),
    },
  ]);

  await upsertMany("agents", [
    humanAgent(ids.humanAgents.maya, "Maya Rivera", "maya.rivera@acme-growth.example", "MANAGER", "AVAILABLE", ["sales", "pricing", "enterprise"]),
    humanAgent(ids.humanAgents.omar, "Omar Williams", "omar.williams@acme-growth.example", "AGENT", "BUSY", ["support", "crm", "implementation"]),
  ]);

  await upsertMany("queues", [
    { _id: ids.queues.sales, organizationId: ids.org, name: "AI Sales Qualification", priority: 9, maxWaitingTime: 90, overflowQueueId: ids.queues.success, active: true, ...timestamps(20) },
    { _id: ids.queues.success, organizationId: ids.org, name: "Implementation Success", priority: 6, maxWaitingTime: 180, overflowQueueId: null, active: true, ...timestamps(20) },
  ]);

  await upsertMany("queueanalytics", [
    queueAnalytics(ids.queues.sales, 18, 0.03, 0.12, 0.09, 0.86, 142),
    queueAnalytics(ids.queues.success, 31, 0.05, 0.18, 0.14, 0.79, 88),
  ]);

  await upsertMany("agentperformances", [
    performance(ids.humanAgents.maya, 96, 382, 93, 0.72, 8, 31, 87),
    performance(ids.humanAgents.omar, 74, 445, 89, 0.61, 13, 18, 76),
  ]);

  await seedWhatsapp(leads);
  await seedRevenue(leads);
  await seedReports();

  console.log("VoiceNexus demo data seeded successfully.");
  console.log(`Organization: Acme Growth Cloud (${ids.org.toString()})`);
  console.log("Login user: owner@acme-growth.example");
  console.log("Demo password: VoiceNexusDemo!2026");
} finally {
  await mongoose.disconnect();
}

async function seedWhatsapp(leads) {
  const contacts = leads.slice(0, 4).map((item, index) => ({
    _id: oid(`65000000000000000000900${index + 1}`),
    organizationId: ids.org,
    leadId: item._id,
    displayName: `${item.firstName} ${item.lastName}`,
    phone: item.phone,
    email: item.email,
    tags: ["demo", item.status.toLowerCase()],
    notes: `WhatsApp follow-up for ${item.company}`,
    lastConversationAt: hoursAgo(index + 3),
    ...timestamps(index + 5),
  }));
  await upsertMany("whatsappcontacts", contacts);
  await upsertMany("whatsappconversations", contacts.map((contact, index) => ({
    _id: oid(`65000000000000000000910${index + 1}`),
    organizationId: ids.org,
    contactId: contact._id,
    leadId: contact.leadId,
    subject: index === 0 ? "Post-call pricing follow-up" : "Implementation checklist",
    status: index === 3 ? "PENDING" : "OPEN",
    assignedTo: ids.agent,
    aiEnabled: true,
    lastMessagePreview: "Thanks, please send the technical checklist and available demo slots.",
    lastMessageAt: hoursAgo(index + 2),
    unreadCount: index === 1 ? 2 : 0,
    runtimeState: index === 2 ? "AI_REPLYING" : "WAITING_FOR_CUSTOMER",
    runtimeUpdatedAt: hoursAgo(index + 2),
    ...timestamps(index + 4),
  })));
  await upsertMany("whatsappmessages", contacts.flatMap((contact, index) => [
    {
      _id: oid(`6500000000000000000092${index + 1}1`),
      organizationId: ids.org,
      conversationId: oid(`65000000000000000000910${index + 1}`),
      contactId: contact._id,
      direction: "INBOUND",
      body: "Can you send the checklist and the pricing recap from the call?",
      status: "READ",
      sentBy: null,
      isAiGenerated: false,
      metadata: demoTag,
      createdAt: hoursAgo(index + 4),
    },
    {
      _id: oid(`6500000000000000000092${index + 1}2`),
      organizationId: ids.org,
      conversationId: oid(`65000000000000000000910${index + 1}`),
      contactId: contact._id,
      direction: "OUTBOUND",
      body: "Absolutely. I am sending the implementation checklist, CRM sync notes, and two demo windows.",
      status: "DELIVERED",
      sentBy: ids.agent,
      isAiGenerated: true,
      metadata: demoTag,
      createdAt: hoursAgo(index + 3),
    },
  ]));
  await upsertMany("whatsapptemplates", [
    {
      _id: oid("650000000000000000009501"),
      organizationId: ids.org,
      name: "post_call_recap",
      category: "UTILITY",
      language: "en",
      body: "Hi {{firstName}}, here is your VoiceNexus recap: {{summary}}. Next step: {{nextStep}}.",
      variables: ["firstName", "summary", "nextStep"],
      status: "APPROVED",
      ...timestamps(18),
    },
  ]);
  await upsertMany("whatsappbroadcasts", [
    {
      _id: oid("650000000000000000009601"),
      organizationId: ids.org,
      name: "June implementation webinar follow-up",
      templateId: oid("650000000000000000009501"),
      messageBody: "Implementation checklist and demo recap",
      contactIds: contacts.map((contact) => contact._id),
      status: "SENT",
      scheduledAt: daysAgo(3),
      sentAt: daysAgo(2),
      metrics: { total: 4, queued: 0, sent: 4, failed: 0 },
      createdBy: ids.manager,
      ...timestamps(5),
    },
  ]);
  await upsertMany("whatsappautomations", [
    {
      _id: oid("650000000000000000009701"),
      organizationId: ids.org,
      name: "First message qualifier",
      trigger: "FIRST_MESSAGE",
      keyword: "",
      responseBody: "Thanks for reaching out. I can help with pricing, implementation, or scheduling a demo.",
      isEnabled: true,
      ...timestamps(12),
    },
  ]);
}

async function seedRevenue(leads) {
  await upsertMany("opportunities", leads.slice(0, 5).map((item, index) => ({
    _id: oid(`65000000000000000000700${index + 1}`),
    organizationId: ids.org,
    leadId: item._id,
    crmContactId: `crm-contact-${index + 1}`,
    crmDealId: `crm-deal-${index + 1}`,
    name: `${item.company} AI calling rollout`,
    value: [84000, 62000, 41000, 28000, 97000][index],
    probability: [0.82, 0.74, 0.56, 0.43, 1][index],
    expectedCloseDate: daysFromNow(18 + index * 9),
    stageId: null,
    stageName: index === 4 ? "Closed Won" : index < 2 ? "Proposal" : "Discovery",
    source: "AI_CALL",
    ownerId: ids.manager,
    aiScore: item.score,
    status: index === 4 ? "WON" : "OPEN",
    ...timestamps(16 - index),
  })));
  await upsertMany("revenueforecasts", [
    {
      _id: oid("650000000000000000007801"),
      organizationId: ids.org,
      period: "MONTH",
      periodStart: startOfMonth(now),
      periodEnd: endOfMonth(now),
      pipelineValue: 312000,
      weightedRevenue: 218640,
      committedRevenue: 97000,
      projectedRevenue: 246000,
      opportunityCount: 5,
      confidence: 0.78,
      ...timestamps(1),
    },
  ]);
  await upsertMany("kpimetrics", [
    kpi("REVENUE", "Projected MRR", 246000, 275000, "usd", "UP"),
    kpi("SALES", "Qualified Leads", 38, 45, "count", "UP"),
    kpi("AI", "AI Resolution Rate", 86, 90, "percent", "UP"),
    kpi("CONVERSION", "Call to Demo Conversion", 41, 38, "percent", "UP"),
    kpi("SUPPORT", "Average Wait Time", 24, 30, "seconds", "DOWN"),
  ]);
}

async function seedReports() {
  await upsertMany("reporttemplates", [
    {
      _id: ids.reportTemplate,
      organizationId: ids.org,
      name: "Executive AI Revenue Brief",
      description: "Weekly view of AI call performance, pipeline, revenue, and follow-up quality.",
      type: "EXECUTIVE",
      sections: ["Pipeline", "AI Runtime", "Queues", "Revenue", "Risks"],
      filters: { period: "weekly", channel: ["voice", "whatsapp"] },
      active: true,
      createdBy: ids.owner,
      ...timestamps(10),
    },
  ]);
  await upsertMany("generatedreports", [
    {
      _id: oid("650000000000000000008101"),
      organizationId: ids.org,
      templateId: ids.reportTemplate,
      scheduledReportId: null,
      title: "Weekly AI Revenue Brief - Demo",
      status: "GENERATED",
      summary: "AI calls generated 38 qualified leads, $218.6k weighted pipeline, and a 41% call-to-demo conversion rate.",
      data: {
        pipelineValue: 312000,
        weightedRevenue: 218640,
        activeRuntimeSessions: 2,
        averageLatencyMs: 740,
        topRisks: ["CRM migration effort", "Security review", "Voice latency expectations"],
      },
      generatedAt: hoursAgo(8),
      ...timestamps(1),
    },
  ]);
  await upsertMany("executivedashboards", [
    {
      _id: oid("650000000000000000008201"),
      organizationId: ids.org,
      period: "MONTHLY",
      revenue: { pipeline: 312000, weighted: 218640, committed: 97000 },
      sales: { qualifiedLeads: 38, demosBooked: 16, winRate: 0.31 },
      ai: { activeSessions: 2, resolutionRate: 0.86, averageLatencyMs: 740 },
      risks: ["Two enterprise prospects require security review"],
      generatedAt: hoursAgo(8),
      ...timestamps(1),
    },
  ]);
}

function member(userId, role, invitedBy) {
  return {
    _id: oid(`6500000000000000000002${role === "OWNER" ? "01" : role === "MANAGER" ? "02" : "03"}`),
    organizationId: ids.org,
    userId,
    role,
    status: "ACTIVE",
    invitedBy,
    joinedAt: daysAgo(44),
    ...timestamps(44),
  };
}

function lead(index, firstName, lastName, email, phone, company, source, status, score) {
  return {
    _id: ids.leads[index],
    organizationId: ids.org,
    firstName,
    lastName,
    email,
    phone,
    company,
    source,
    status,
    score,
    language: "en",
    assignedTo: ids.agent,
    tags: [],
    notesCount: index + 1,
    lastActivityAt: daysAgo(index + 1),
    ...timestamps(35 - index),
  };
}

function call(item, index) {
  const startedAt = daysAgo(index + 1);
  return {
    _id: oid(`65000000000000000000c00${index + 1}`),
    organizationId: ids.org,
    leadId: item._id,
    phoneNumberId: ids.phone,
    provider: "TWILIO",
    providerCallSid: `CA_DEMO_${String(index + 1).padStart(6, "0")}`,
    direction: index % 2 ? "INBOUND" : "OUTBOUND",
    status: index < 4 ? "COMPLETED" : "IN_PROGRESS",
    from: index % 2 ? item.phone : "+15555550100",
    to: index % 2 ? "+15555550100" : item.phone,
    initiatedBy: index % 2 ? null : ids.agent,
    startedAt,
    endedAt: index < 4 ? new Date(startedAt.getTime() + (260 + index * 35) * 1000) : null,
    durationSeconds: index < 4 ? 260 + index * 35 : null,
    recordingEnabled: true,
    ...timestamps(index + 1),
  };
}

function callEvents(callRecord, index) {
  return [
    event(callRecord, index, 1, "CALL_QUEUED", "Call queued", "Twilio accepted the call", "queued"),
    event(callRecord, index, 2, "CALL_ANSWERED", "Call answered", "Media stream connected", "in-progress"),
    event(callRecord, index, 3, "CALL_COMPLETED", index < 4 ? "Call completed" : "Call active", "AI transcript and response loop completed", index < 4 ? "completed" : "in-progress"),
  ];
}

function event(callRecord, callIndex, eventIndex, type, title, description, providerStatus) {
  return {
    _id: oid(`65000000000000000000d${callIndex + 1}0${eventIndex}`),
    organizationId: ids.org,
    callSessionId: callRecord._id,
    type,
    title,
    description,
    providerStatus,
    metadata: { ...demoTag, streamSid: `MZ_DEMO_${callIndex + 1}` },
    createdAt: new Date(callRecord.startedAt.getTime() + eventIndex * 30_000),
  };
}

function humanAgent(_id, name, email, role, status, skills) {
  return { _id, organizationId: ids.org, name, email, role, status, activeSessionId: null, skills, ...timestamps(22) };
}

function queueAnalytics(queueId, waitTime, abandonmentRate, transferRate, escalationRate, resolutionRate, sessionsHandled) {
  return {
    _id: oid(queueId.equals(ids.queues.sales) ? "650000000000000000003101" : "650000000000000000003102"),
    organizationId: ids.org,
    queueId,
    waitTime,
    abandonmentRate,
    transferRate,
    escalationRate,
    resolutionRate,
    sessionsHandled,
    computedAt: hoursAgo(6),
    ...timestamps(1),
  };
}

function performance(agentId, callsHandled, averageDuration, averageQaScore, averageSentiment, transfers, conversions, leadQuality) {
  return {
    _id: oid(agentId.equals(ids.humanAgents.maya) ? "650000000000000000004201" : "650000000000000000004202"),
    organizationId: ids.org,
    agentId,
    callsHandled,
    averageDuration,
    averageQaScore,
    averageSentiment,
    transfers,
    conversions,
    leadQuality,
    computedAt: hoursAgo(5),
    ...timestamps(1),
  };
}

function kpi(category, name, value, target, unit, trend) {
  const suffix = String(Math.abs(hash(`${category}:${name}`))).slice(0, 3).padStart(3, "0");
  return {
    _id: oid(`650000000000000000008${suffix}`),
    organizationId: ids.org,
    category,
    name,
    value,
    target,
    unit,
    trend,
    period: "MONTHLY",
    measuredAt: hoursAgo(8),
    ...timestamps(1),
  };
}

function memorySummary(company, index) {
  const summaries = [
    "High-intent enterprise buyer evaluating AI call automation for inbound demo qualification.",
    "Healthcare operations team needs HIPAA-conscious call routing and human handoff controls.",
    "Retail team wants WhatsApp follow-up after missed calls and stronger callback conversion.",
    "Technical founder is price-sensitive but interested in latency and STT quality benchmarks.",
    "Customer signed pilot and wants expansion plan for multiple regions.",
    "Early lead researching options; needs education before demo booking.",
  ];
  return `${company}: ${summaries[index]}`;
}

function timestamps(days) {
  const createdAt = daysAgo(days);
  return { createdAt, updatedAt: hoursAgo(Math.max(1, days * 3)) };
}

function daysAgo(days) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

function daysFromNow(days) {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function oid(value) {
  return new mongoose.Types.ObjectId(value);
}

function hash(value) {
  return value.split("").reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
}

async function upsertMany(collectionName, docs) {
  if (!docs.length) return;
  const collection = db.collection(collectionName);
  await collection.bulkWrite(
    docs.map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true,
      },
    })),
    { ordered: false },
  );
  console.log(`Seeded ${docs.length} ${collectionName}`);
}
