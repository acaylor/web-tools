export { getReleaseNotes, prepareChangelog };

function sections(content) {
  const headings = [...content.matchAll(/^## ([^\r\n]+)\r?$/gm)];
  return headings.map((heading, index) => {
    const end = headings[index + 1]?.index ?? content.length;
    return [content.slice(heading.index, end), heading[1], content.slice(heading.index + heading[0].length, end)];
  });
}

function getReleaseNotes(content, version) {
  const section = sections(content).find(([, title]) => version
    ? title === `Version ${version}`
    : title.startsWith('Version '));
  if (!section || !section[2].trim()) {
    throw new Error(`Missing or empty changelog entry for ${version ?? 'the latest release'}`);
  }
  return section[2].trim();
}

function prepareChangelog(content, version) {
  const entries = sections(content);
  if (entries.some(([, title]) => title === `Version ${version}`)) {
    throw new Error(`Version ${version} already exists in the changelog`);
  }
  const unreleased = entries.find(([, title]) => title === 'Unreleased');
  if (!unreleased || !/^\s*-\s+\S/m.test(unreleased[2])) {
    throw new Error('Add release notes under ## Unreleased before preparing a release');
  }
  return content.replace(unreleased[0], `## Unreleased\n\n## Version ${version}\n\n${unreleased[2].trim()}\n\n`);
}
