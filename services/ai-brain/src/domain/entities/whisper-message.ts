export type WhisperTarget = "AGENT" | "AI";
export type WhisperSenderRole = "SUPERVISOR" | "AGENT";

export interface WhisperMessage {
  id: string;
  organizationId: string;
  sessionId: string;
  senderId: string;
  senderRole: WhisperSenderRole;
  target: WhisperTarget;
  targetAgentId: string | null;
  content: string;
  private: true;
  createdAt: Date;
}
