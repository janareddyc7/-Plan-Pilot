import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

// Lightweight guardrail, not a full CSS parser or a substitute for visual review.
const palette =
  "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
const patterns = [
  /#[\da-fA-F]{3,8}\b/g,
  new RegExp(
    "\\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|placeholder|divide|caret|accent)-(?:white|black|" +
      palette +
      "-\\d{2,3})(?=[/\\s\"'\x60}:\\]])",
    "g",
  ),
  /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/g,
  /\b(?:color|background|backgroundColor|borderColor|fill|stroke)\s*:\s*["']?(?:white|black|red|blue|green|gray|grey)\b/g,
];
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory()
          ? files(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      ),
    )
  ).flat();
}
const violations = [];
for (const file of await files("src")) {
  if (
    !/\.(?:tsx?|css)$/.test(file) ||
    file.replaceAll("\\", "/") === "src/styles/theme.css"
  )
    continue;
  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(line)) {
        violations.push(
          `${file}:${index + 1} uses a raw color; use a semantic theme token.`,
        );
        break;
      }
    }
  });
}
if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else console.log("Theme check passed: source files use semantic colors.");
