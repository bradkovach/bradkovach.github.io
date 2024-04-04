const now = new Date();
let contents =
  `export const lastUpdated = new Date('${now.toISOString()}');` + "\n";

// write contents to 'projects/bradkovach.github.io/src/app/routes/choice-gas/data/last-updated.ts'
import fs from "node:fs";
import path from "node:path";
const filePath = path.join(
  process.cwd(),
  "projects/bradkovach.github.io/src/app/routes/choice-gas/data/last-updated.ts",
);
fs.writeFileSync(filePath, contents);
