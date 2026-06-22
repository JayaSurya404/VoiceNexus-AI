export type KnowledgeDocumentType = "PDF" | "DOCX" | "TXT" | "MARKDOWN";
export type KnowledgeDocumentStatus = "UPLOADED" | "PARSED" | "CHUNKED" | "EMBEDDED" | "FAILED";

export interface KnowledgeDocument {
  id: string;
  organizationId: string;
  knowledgeBaseId: string;
  title: string;
  documentType: KnowledgeDocumentType;
  status: KnowledgeDocumentStatus;
  sourceName: string;
  contentHash: string;
  metadata: Record<string, unknown>;
  error: string | null;
  chunkCount: number;
  uploadedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
