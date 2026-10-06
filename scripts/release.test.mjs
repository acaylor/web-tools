import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { getReleaseNotes, prepareChangelog } from './shared/changelog.mjs';
import { assertVersion, isNewerVersion } from './shared/version.mjs';

const releaseScript = fileURLToPath(new URL('./release.mjs', import.meta.url));
const notesScript = fileURLToPath(new URL('./getLatestChangelog.mjs', import.meta.url));
const original = '# Changelog\n\n## Unreleased\n\n### Fixes\n\n- Keep this curated note\n\n## Version 0.1.0\n\n- Original release\n';

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'web-tools-release-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '--initial-branch=main');
  git('config', 'user.name', 'Release Test');
  git('config', 'user.email', 'release@example.invalid');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'tag.gpgsign', 'false');
  writeFileSync(join(cwd, 'package.json'), '{"name":"fixture","version":"0.1.0"}\n');
  writeFileSync(join(cwd, 'CHANGELOG.md'), original);
  git('add', '.');
  git('commit', '-m', 'Initial release');
  git('tag', 'v0.1.0');
  git('switch', '-c', 'release/v0.2.0');
  const run = (...args) => spawnSync(process.execPath, [releaseScript, ...args], { cwd, encoding: 'utf8' });
  const read = (path) => readFileSync(join(cwd, path), 'utf8');
  return { cwd, git, run, read };
}

test('stable semantic versions reject date-based names, prefixes, suffixes, and leading zeroes', () => {
  for (const version of ['0.2.0', '1.0.0', '10.20.30']) {
    assert.doesNotThrow(() => assertVersion(version));
  }
  for (const version of ['v0.2.0', '0.2', '00.2.0', '0.02.0', '0.2.0-beta.1', '0.2.0+build', '2026.10.05-abc', undefined]) {
    assert.throws(() => assertVersion(version), /Invalid release version/);
  }
  assert.equal(isNewerVersion('0.10.0', '0.9.9'), true);
  assert.equal(isNewerVersion('1.0.0', '0.99.99'), true);
  assert.equal(isNewerVersion('0.2.0', '0.2.0'), false);
  assert.equal(isNewerVersion('0.1.9', '0.2.0'), false);
});

test('promote curated notes once, preserve historical entries, and skip Unreleased when extracting notes', () => {
  const prepared = prepareChangelog(original, '0.2.0');
  assert.match(prepared, /## Unreleased\n\n## Version 0\.2\.0/);
  assert.ok(prepared.endsWith('## Version 0.1.0\n\n- Original release\n'));
  assert.equal(getReleaseNotes(prepared), '### Fixes\n\n- Keep this curated note');
  assert.equal(getReleaseNotes(prepared, '0.1.0'), '- Original release');
  assert.equal(getReleaseNotes(prepareChangelog(original.replaceAll('\n', '\r\n'), '0.2.0'), '0.2.0'), '### Fixes\r\n\r\n- Keep this curated note');
  assert.throws(() => prepareChangelog(prepared, '0.2.0'), /already exists/);
  assert.throws(() => prepareChangelog(prepared, '0.3.0'), /Add release notes/);
  assert.throws(() => getReleaseNotes(prepared, '0.2.1'), /Missing or empty/);
  assert.throws(() => prepareChangelog('# Changelog\n', '0.2.0'), /Add release notes/);
});

test('preparation dry run does not modify files, commits, or tags', (t) => {
  const { git, run, read } = fixture(t);
  const head = git('rev-parse', 'HEAD');
  const result = run('0.2.0', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git('rev-parse', 'HEAD'), head);
  assert.equal(read('CHANGELOG.md'), original);
  assert.equal(JSON.parse(read('package.json')).version, '0.1.0');
  assert.equal(git('tag', '--list'), 'v0.1.0');
});

test('prepare one clean release commit, verify metadata, and tag only the merged main commit', (t) => {
  const { cwd, git, run, read } = fixture(t);
  const head = git('rev-parse', 'HEAD');
  let result = run('0.2.0', '--yes');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git('rev-list', '--count', `${head}..HEAD`), '1');
  assert.equal(git('status', '--porcelain'), '');
  assert.equal(git('tag', '--list'), 'v0.1.0');
  assert.equal(JSON.parse(read('package.json')).version, '0.2.0');
  assert.equal(run('0.2.0', '--verify').status, 0);
  assert.equal(run('0.2.1', '--verify').status, 1);
  const notes = spawnSync(process.execPath, [notesScript, '0.2.0'], { cwd, encoding: 'utf8' });
  assert.equal(notes.status, 0, notes.stderr);
  assert.equal(notes.stdout.trim(), '### Fixes\n\n- Keep this curated note');
  assert.match(run('0.2.0', '--tag', '--yes').stderr, /Tag releases from main/);
  git('switch', 'main');
  git('merge', '--ff-only', 'release/v0.2.0');
  git('update-ref', 'refs/remotes/origin/main', 'HEAD');
  result = run('0.2.0', '--tag', '--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git('tag', '--list', 'v0.2.0'), '');
  result = run('0.2.0', '--tag', '--yes');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git('cat-file', '-t', 'v0.2.0'), 'tag');
  assert.equal(git('rev-parse', 'v0.2.0^{}'), git('rev-parse', 'HEAD'));
  assert.match(run('0.2.0', '--tag', '--yes').stderr, /already exists/);
});

test('refuse dirty trees, existing tags, non-increasing versions, and preparation on main', (t) => {
  const { cwd, git, run } = fixture(t);
  assert.match(run('0.1.0', '--yes').stderr, /already exists/);
  assert.match(run('0.0.9', '--yes').stderr, /must be newer/);
  assert.match(run('v0.2.0', '--yes').stderr, /Invalid release version/);
  assert.match(run('0.2.0').stderr, /Use --yes/);
  git('switch', 'main');
  assert.match(run('0.2.0', '--yes').stderr, /Prepare releases on a branch/);
  git('switch', 'release/v0.2.0');
  writeFileSync(join(cwd, 'untracked.txt'), 'Do not commit me');
  assert.match(run('0.2.0', '--yes').stderr, /working tree changes/);
});

test('refuse tags when main differs from fetched origin/main or release notes are missing', (t) => {
  const { cwd, git, run } = fixture(t);
  assert.equal(run('0.2.0', '--yes').status, 0);
  git('switch', 'main');
  git('update-ref', 'refs/remotes/origin/main', 'HEAD');
  git('merge', '--ff-only', 'release/v0.2.0');
  assert.match(run('0.2.0', '--tag', '--yes').stderr, /Tag releases from main/);
  writeFileSync(join(cwd, 'CHANGELOG.md'), '# Changelog\n\n## Unreleased\n');
  assert.match(run('0.2.0', '--verify').stderr, /Missing or empty/);
});
