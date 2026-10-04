# PlanPilot PDF test data

These three PDFs are synthetic fixtures for testing the upload and Gemini review flow. They are deliberately labeled **SYNTHETIC TEST DOCUMENT - NOT INSURANCE ADVICE** and contain no real patient or insurer information.

- `01_synthetic_ppo_complete.pdf`: complete happy-path PPO extraction.
- `02_synthetic_ppo_ambiguous.pdf`: missing amounts and broad language; Gemini should leave fields unresolved.
- `03_synthetic_network_edge_cases.pdf`: renewal date, waiting period, balance billing, and network edge cases.

Upload them from **My plan → Upload & extract**. Review the candidate values, correct anything needed, and confirm only after checking the source text. The PDFs are regenerated with:

```powershell
node scripts/create-test-benefit-pdfs.mjs
```
