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

import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dirPath = new URL(
	'../projects/choice-gas/src/app/data/',
	import.meta.url,
);

const filePath = new URL('./last-updated.ts', dirPath);

fs.mkdir(fileURLToPath(dirPath), { recursive: true })
	.then(() => fs.writeFile(filePath, contents))
	.then(() => console.log(`Wrote last updated timestamp to ${filePath}`));
