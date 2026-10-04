PlanPilot uses a server-side AI provider through the Vercel AI SDK.

- `extract.ts` asks the AI system for candidate plan fields using a Zod schema.
- Monetary values are transcribed as printed dollar strings and converted to cents by deterministic code only.
- Source quotes are retained only when they can be verified against the extracted page text.
- PDFs are untrusted data. The model is instructed to ignore embedded instructions.
- Results always return `isConfirmed: false`; the user must review the draft before it reaches the claims engine.
- Missing server AI credentials is an honest manual-entry fallback, not a fake AI response.
