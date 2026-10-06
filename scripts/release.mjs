import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { getReleaseNotes, prepareChangelog } from './shared/changelog.mjs';
import { assertVersion, isNewerVersion } from './shared/version.mjs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      'dry-run': { type: 'boolean' },
      tag: { type: 'boolean' },
      verify: { type: 'boolean' },
      yes: { type: 'boolean' },
    },
  });
  if (positionals.length !== 1 || (values.tag && values.verify)) {
    throw new Error('Usage: pnpm release <major.minor.patch> [--dry-run] [--yes] [--tag | --verify]');
  }
  const [version] = positionals;
  assertVersion(version);
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const changelog = await readFile('CHANGELOG.md', 'utf8');
  assertVersion(pkg.version);

  if (values.verify || values.tag) {
    if (pkg.version !== version) {
      throw new Error(`Package version ${pkg.version} does not match release ${version}`);
    }
    getReleaseNotes(changelog, version);
    if (values.verify) {
      console.log(`Release v${version} matches package.json and CHANGELOG.md`);
      return;
    }
  }

  if (git('status', '--porcelain')) {
    throw new Error('Commit or stash working tree changes before releasing');
  }
  if (git('tag', '--list', `v${version}`)) {
    throw new Error(`Tag v${version} already exists`);
  }
  const branch = git('branch', '--show-current');
  let nextChangelog;
  if (values.tag) {
    if (branch !== 'main' || git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) {
      throw new Error('Tag releases from main at origin/main after fetching and merging the release PR');
    }
  }
  else {
    if (!branch || branch === 'main') {
      throw new Error('Prepare releases on a branch and merge them through a pull request');
    }
    if (!isNewerVersion(version, pkg.version)) {
      throw new Error(`Release ${version} must be newer than ${pkg.version}`);
    }
    nextChangelog = prepareChangelog(changelog, version);
  }

  console.log(values.tag
    ? `Create annotated tag v${version} at ${git('rev-parse', '--short', 'HEAD')}`
    : `Prepare v${version}: update package.json, promote Unreleased notes, and commit`);
  if (values['dry-run']) {
    console.log('[dry-run] No files, commits, or tags changed');
    return;
  }
  if (!values.yes) {
    if (!process.stdin.isTTY) {
      throw new Error('Use --yes for non-interactive releases');
    }
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    let answer;
    try {
      answer = await prompt.question('Continue? [y/N] ');
    }
    finally {
      prompt.close();
    }
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log('Aborting');
      return;
    }
  }

  if (values.tag) {
    git('tag', '-a', `v${version}`, '-m', `Release v${version}`);
    console.log(`Tag created. Publish with: git push origin v${version}`);
    return;
  }
  pkg.version = version;
  await writeFile('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
  await writeFile('CHANGELOG.md', nextChangelog);
  git('add', '--', 'package.json', 'CHANGELOG.md');
  git('commit', '-m', `chore(release): prepare v${version}`);
  console.log('Release commit created. Push the branch and open a pull request before tagging.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
