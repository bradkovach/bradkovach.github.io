const now = new Date();
const contents =
	`export const lastUpdated = new Date('${now.toISOString()}');` + '\n';

// if not running via npm, exit
if (process.env.npm_lifecycle_event !== 'update-last-updated') {
	console.error(
		'This script should be run via npm: npm run update-last-updated',
	);
	process.exit(1);
}

// write contents to 'projects/bradkovach.github.io/src/app/routes/choice-gas/data/last-updated.ts'
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// /home/bkovach/github/bradkovach.github.io/projects/choice-gas/src/app/data/last-updated.ts
const filePath = new URL(
	'../projects/choice-gas/src/app/data/last-updated.ts',
	import.meta.url,
);
console.log(filePath.toString());
fs.mkdirSync(path.dirname(fileURLToPath(filePath)), { recursive: true });

fs.writeFileSync(filePath, contents);
