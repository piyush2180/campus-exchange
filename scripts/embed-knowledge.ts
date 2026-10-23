// Embeds the Pulse AI knowledge base with Gemini and upserts it into the pgvector knowledge_docs table.
// Run after applying migrations and whenever src/services/copilot/knowledgeBase.ts changes:
//   npm run embed:knowledge
// Needs SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY in .env.
import { createClient } from "@supabase/supabase-js";
import { KNOWLEDGE_BASE_DOCS } from "../src/services/copilot/knowledgeBase.ts";
import { embedText } from "../src/services/copilot/embeddings.ts";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !serviceRoleKey || !geminiKey) {
  console.error(
    "Missing env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY and GEMINI_API_KEY are required.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = [];
for (const doc of KNOWLEDGE_BASE_DOCS) {
  const embedding = await embedText(
    `${doc.title}\n\n${doc.content}`,
    geminiKey,
    "RETRIEVAL_DOCUMENT",
  );
  rows.push({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    content: doc.content,
    tags: doc.tags,
    embedding: JSON.stringify(embedding),
  });
  console.log(`✔ embedded ${doc.id}`);
}

const { error } = await supabase.from("knowledge_docs").upsert(rows, { onConflict: "id" });
if (error) {
  console.error("Upsert into knowledge_docs failed:", error.message);
  process.exit(1);
}

// Remove docs that were deleted from knowledgeBase.ts so retrieval never returns stale content
const ids = rows.map((r) => r.id);
const { error: pruneError } = await supabase
  .from("knowledge_docs")
  .delete()
  .not("id", "in", `(${ids.map((id) => `"${id}"`).join(",")})`);
if (pruneError) {
  console.error("Pruning stale knowledge_docs failed:", pruneError.message);
  process.exit(1);
}

console.log(`Upserted ${rows.length} knowledge docs into pgvector.`);
