/**
 * Gemini text embeddings for pgvector retrieval.
 * Shared by the server function (query embeddings) and scripts/embed-knowledge.ts (document embeddings).
 * Must stay dependency-free so the Node script can import it directly.
 */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768; // must match knowledge_docs.embedding vector(768)

export type EmbeddingTaskType = "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT";

export async function embedText(
  text: string,
  apiKey: string,
  taskType: EmbeddingTaskType,
): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini embedding API returned status ${res.status}`);
  }

  const json = (await res.json()) as { embedding?: { values?: number[] } };
  const values = json.embedding?.values;
  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Gemini embedding API returned an unexpected embedding shape.");
  }

  // Truncated (non-3072) Gemini embeddings are not unit length; normalize so cosine scores are comparable
  const norm = Math.hypot(...values);
  return values.map((v) => v / norm);
}
