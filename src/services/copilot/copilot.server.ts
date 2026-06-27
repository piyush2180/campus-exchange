import { createServerFn } from "@tanstack/react-start";

/**
 * Secure Server Function to invoke Google Gemini 2.5 Flash.
 * Runs strictly on the server side (Node/Vercel/Cloudflare environment).
 * Never exposes GEMINI_API_KEY to client bundles.
 */
export const fetchGeminiResponse = createServerFn({ method: "POST" }).handler(
  async (ctx: any) => {
    const prompt = ctx?.data?.prompt ?? ctx?.prompt ?? "";
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
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

    const json = (await apiRes.json()) as any;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return { text };
  },
);
