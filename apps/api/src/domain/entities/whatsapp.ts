import type {
  WhatsappAutomationTrigger,
  WhatsappConversationStatus,
  WhatsappMessageDirection,
  WhatsappMessageStatus,
  WhatsappTemplateCategory,
  WhatsappTemplateStatus,
} from "@voicenexus/contracts";

export interface WhatsappContact {
  id: string;
  organizationId: string;
  leadId: string | null;
  displayName: string;
  phone: string;
  email: string | null;
  tags: string[];
  notes: string;
  lastConversationAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWhatsappContact {
  organizationId: string;
  leadId: string | null;
  displayName: string;
  phone: string;
  email: string | null;
  tags: string[];
  notes: string;
  lastConversationAt: Date | null;
}

export type WhatsappContactUpdate = Partial<Omit<NewWhatsappContact, "organizationId">>;

export interface WhatsappConversation {
  id: string;
  organizationId: string;
  contactId: string;
  leadId: string | null;
  subject: string;
  status: WhatsappConversationStatus;
  assignedTo: string | null;
  aiEnabled: boolean;
  lastMessagePreview: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  runtimeState: "IDLE" | "WAITING_FOR_CUSTOMER" | "WAITING_FOR_AGENT" | "AI_REPLYING";
  runtimeUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWhatsappConversation {
  organizationId: string;
  contactId: string;
  leadId: string | null;
  subject: string;
  status: WhatsappConversationStatus;
  assignedTo: string | null;
  aiEnabled: boolean;
  lastMessagePreview: string;
  lastMessageAt: Date | null;
  unreadCount: number;
  runtimeState: WhatsappConversation["runtimeState"];
  runtimeUpdatedAt: Date;
}

export type WhatsappConversationUpdate = Partial<
  Pick<
    WhatsappConversation,
    | "status"
    | "assignedTo"
    | "aiEnabled"
    | "lastMessagePreview"
    | "lastMessageAt"
    | "unreadCount"
    | "runtimeState"
    | "runtimeUpdatedAt"
  >
>;

export interface WhatsappMessage {
  id: string;
  organizationId: string;
  conversationId: string;
  contactId: string;
  direction: WhatsappMessageDirection;
  body: string;
  status: WhatsappMessageStatus;
  sentBy: string | null;
  isAiGenerated: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface NewWhatsappMessage {
  organizationId: string;
  conversationId: string;
  contactId: string;
  direction: WhatsappMessageDirection;
  body: string;
  status: WhatsappMessageStatus;
  sentBy: string | null;
  isAiGenerated: boolean;
  metadata: Record<string, unknown>;
}

export interface WhatsappTemplate {
  id: string;
  organizationId: string;
  name: string;
  category: WhatsappTemplateCategory;
  language: string;
  body: string;
  variables: string[];
  status: WhatsappTemplateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWhatsappTemplate {
  organizationId: string;
  name: string;
  category: WhatsappTemplateCategory;
  language: string;
  body: string;
  variables: string[];
  status: WhatsappTemplateStatus;
}

export interface WhatsappBroadcast {
  id: string;
  organizationId: string;
  name: string;
  templateId: string | null;
  messageBody: string;
  contactIds: string[];
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
  scheduledAt: Date | null;
  sentAt: Date | null;
  metrics: {
    total: number;
    queued: number;
    sent: number;
    failed: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWhatsappBroadcast {
  organizationId: string;
  name: string;
  templateId: string | null;
  messageBody: string;
  contactIds: string[];
  status: WhatsappBroadcast["status"];
  scheduledAt: Date | null;
  sentAt: Date | null;
  metrics: WhatsappBroadcast["metrics"];
  createdBy: string;
}

export interface WhatsappAutomation {
  id: string;
  organizationId: string;
  name: string;
  trigger: WhatsappAutomationTrigger;
  keyword: string;
  responseBody: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewWhatsappAutomation {
  organizationId: string;
  name: string;
  trigger: WhatsappAutomationTrigger;
  keyword: string;
  responseBody: string;
  isEnabled: boolean;
}
