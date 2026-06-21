export interface ToolExecution {
  id: string;
  conversationId: string | null;
  agentSessionId: string | null;
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  success: boolean;
  error: string | null;
  executedAt: Date;
}
