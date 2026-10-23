import { createServerFn } from "@tanstack/react-start";
import { embedText } from "./embeddings";

/**
 * Secure Server Function that embeds a user query with Gemini for pgvector similarity search.
 * Keeps GEMINI_API_KEY on the server, like fetchGeminiResponse.
 */
export const embedQuery = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => data)
  .handler(async ({ data }) => {
    const text = data.text ?? "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing Gemini API Key on server environment.");
    }
    if (!text.trim()) {
      throw new Error("Cannot embed an empty query.");
    }

    const embedding = await embedText(text.slice(0, 2000), apiKey, "RETRIEVAL_QUERY");
    return { embedding };
  });

/**
 * Secure Server Function to invoke Google Gemini 2.5 Flash.
 * Runs strictly on the server side (Node/Vercel/Cloudflare environment).
 * Never exposes GEMINI_API_KEY to client bundles.
 */
export const fetchGeminiResponse = createServerFn({ method: "POST" })
  .inputValidator((data: { prompt: string }) => data)
  .handler(async ({ data }) => {
    const prompt = data.prompt ?? "";
    const apiKey =
      process.env.GEMINI_API_KEY ||
      (typeof process !== "undefined" ? process.env.GEMINI_API_KEY : undefined);

    if (!apiKey) {
      throw new Error("Missing Gemini API Key on server environment.");
    }

    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    if (!apiRes.ok) {
      throw new Error(`Gemini Server API returned status ${apiRes.status}`);
    }

    const json = (await apiRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { text };
  });
