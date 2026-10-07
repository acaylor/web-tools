export { assertVersion, isNewerVersion };

function assertVersion(version) {
  if (typeof version !== 'string' || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Invalid release version: ${version}. Use major.minor.patch without a v prefix; prereleases are not supported.`);
  }
}

function isNewerVersion(version, current) {
  assertVersion(version);
  assertVersion(current);
  const next = version.split('.').map(BigInt);
  const previous = current.split('.').map(BigInt);
  for (let i = 0; i < next.length; i++) {
    if (next[i] !== previous[i]) {
      return next[i] > previous[i];
    }
  }
  return false;
}
