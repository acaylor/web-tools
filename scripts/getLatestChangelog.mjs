import { readFile } from 'node:fs/promises';
import { getReleaseNotes } from './shared/changelog.mjs';

const changelogContent = await readFile('./CHANGELOG.md', 'utf-8');
console.log(getReleaseNotes(changelogContent, process.argv[2]));
