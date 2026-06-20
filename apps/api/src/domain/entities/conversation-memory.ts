import type { MemorySentiment, MemorySource } from "@voicenexus/contracts";

export interface ConversationMemory {
  id: string;
  organizationId: string;
  leadId: string;
  source: MemorySource;
  content: string;
  sentiment: MemorySentiment;
  importance: number;
  createdAt: Date;
}

export interface NewConversationMemory {
  organizationId: string;
  leadId: string;
  source: MemorySource;
  content: string;
  sentiment: MemorySentiment;
  importance: number;
}
