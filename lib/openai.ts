import "server-only";

import OpenAI from "openai";

/**
 * Server-only OpenAI client used by Howlsy's AI services.
 *
 * The API key is loaded from the server environment and must never
 * be exposed to client components or committed to source control.
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});