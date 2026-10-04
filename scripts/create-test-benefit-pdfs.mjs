import fs from "node:fs";
import path from "node:path";

const out = path.resolve("output/pdf");
fs.mkdirSync(out, { recursive: true });

function escapePdf(value) { return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)"); }
function makePdf(file, title, lines) {
  const wrapped = lines.flatMap((line) => {
    const words = line.split(" "); const chunks = []; let current = "";
    for (const word of words) { if ((current + " " + word).trim().length > 88) { chunks.push(current); current = word; } else current = (current + " " + word).trim(); }
    if (current) chunks.push(current); return chunks;
  });
  const content = ["BT", "/F1 18 Tf", "50 750 Td", `(${escapePdf(title)}) Tj`, "/F1 10 Tf", "0 -28 Td", ...wrapped.flatMap((line) => [`(${escapePdf(line)}) Tj`, "0 -15 Td"]), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(pdf, "ascii")); pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const start = Buffer.byteLength(pdf, "ascii"); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  fs.writeFileSync(path.join(out, file), pdf, "ascii");
}

makePdf("01_synthetic_ppo_complete.pdf", "Northstar Dental PPO - Benefits Summary", [
  "SYNTHETIC TEST DOCUMENT - NOT INSURANCE ADVICE",
  "Complete text-based fixture for PlanPilot Gemini extraction.",
  "PLAN OVERVIEW", "Plan type: PPO", "Benefit year: January 1 through December 31", "Annual maximum: $1,500 per individual", "Individual deductible: $50 per benefit year", "Deductible already met: $0", "Annual maximum already used: $260",
  "COVERAGE BY SERVICE CLASS", "Preventive: 100% of the allowed amount; deductible does not apply", "Basic: 80% of the allowed amount after the deductible", "Major: 50% of the allowed amount after the deductible",
  "NETWORK RULES", "In-network providers accept the negotiated allowed amount and write off the difference. Out-of-network members may owe amounts above the allowed amount. Verify network status before treatment.", "No waiting period is stated in this synthetic summary. Treatment timing must be confirmed with the dentist.",
]);
makePdf("02_synthetic_ppo_ambiguous.pdf", "Harbor Dental Plan - Summary Excerpt", [
  "SYNTHETIC TEST DOCUMENT - NOT INSURANCE ADVICE", "Ambiguous fixture for unresolved-field and manual-review testing.", "PLAN OVERVIEW", "Plan type: PPO", "The plan has a yearly limit; see the certificate for the exact amount.", "A deductible may apply to certain services. The amount is not shown in this excerpt.", "Plan year begins on the employer renewal date.", "COVERAGE LANGUAGE", "Preventive services are covered at no charge when performed by a participating provider. Basic and major services are covered according to the schedule of benefits. Exact percentages and allowed amounts are not included on this page.", "REVIEW NOTE", "PlanPilot should leave unknown fields unresolved and require manual confirmation.",
]);
makePdf("03_synthetic_network_edge_cases.pdf", "Summit Dental Choice - Network Rules", [
  "SYNTHETIC TEST DOCUMENT - NOT INSURANCE ADVICE", "Edge-case fixture for deductible, balance-billing, and waiting-period extraction.", "PLAN OVERVIEW", "Plan type: PPO", "Annual maximum: $2,000 per individual", "Individual deductible: $100 per benefit year", "Deductible already used: $25", "Annual maximum already used: $400", "Renewal date: July 1", "COVERAGE BY SERVICE CLASS", "Preventive: 90%; preventive payments count toward the annual maximum", "Basic: 80% after the remaining deductible", "Major: 50% after the remaining deductible", "NETWORK AND ALLOWED AMOUNTS", "In-network claims use the negotiated allowed amount. Out-of-network claims use the plan allowed amount; the member is responsible for balance billing above that amount when applicable.", "WAITING PERIOD", "Major services are eligible beginning 2027-01-01. Basic and preventive services have no waiting period stated.", "TEST PROCEDURE EXAMPLES", "A basic filling may be billed at $200 with an allowed amount of $150. A major crown may be billed at $1,200 with an allowed amount of $900. These are testing examples only.",
]);
console.log(fs.readdirSync(out).filter((name) => name.endsWith(".pdf")).map((name) => path.join(out, name)).join("\n"));
