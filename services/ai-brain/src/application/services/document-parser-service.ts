import type { KnowledgeDocumentType } from "../../domain/entities/knowledge-document.js";

export interface ParseDocumentInput {
  documentType: KnowledgeDocumentType;
  content: string;
  encoding?: "text" | "base64";
}

export class DocumentParserService {
  parse(input: ParseDocumentInput): string {
    const raw =
      input.encoding === "base64"
        ? Buffer.from(input.content, "base64").toString("utf8")
        : input.content;

    if (input.documentType === "TXT" || input.documentType === "MARKDOWN") {
      return normalizeText(raw);
    }

    return normalizeText(raw.replace(/[^\t\n\r -~]+/g, " "));
  }
}

function normalizeText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}