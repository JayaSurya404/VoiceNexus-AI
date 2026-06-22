export interface ChunkTextInput {
  text: string;
  maxCharacters?: number;
  overlapCharacters?: number;
}

export interface TextChunk {
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

export class ChunkingService {
  chunk(input: ChunkTextInput): TextChunk[] {
    const maxCharacters = input.maxCharacters ?? 1200;
    const overlapCharacters = input.overlapCharacters ?? 150;
    const paragraphs = input.text.split(/\n{2,}/).map((value) => value.trim()).filter(Boolean);
    const chunks: TextChunk[] = [];
    let current = "";

    for (const paragraph of paragraphs) {
      const next = current ? `${current}\n\n${paragraph}` : paragraph;
      if (next.length <= maxCharacters) {
        current = next;
        continue;
      }
      if (current) chunks.push(toChunk(chunks.length, current));
      current = paragraph.length > maxCharacters ? paragraph.slice(0, maxCharacters) : paragraph;
    }

    if (current) chunks.push(toChunk(chunks.length, current));

    return chunks.map((chunk, index) => {
      if (index === 0 || overlapCharacters <= 0) return chunk;
      const previous = chunks[index - 1]?.content ?? "";
      const overlap = previous.slice(Math.max(0, previous.length - overlapCharacters));
      return toChunk(index, `${overlap}\n${chunk.content}`.trim());
    });
  }
}

function toChunk(chunkIndex: number, content: string): TextChunk {
  return {
    chunkIndex,
    content,
    tokenCount: Math.ceil(content.length / 4),
  };
}
