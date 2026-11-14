function normalizePath(filePath) {
  const normalized = String(filePath).replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '');
  if (!normalized) throw new Error('Storage path must not be empty');
  return normalized;
}

function parentPaths(filePath) {
  const segments = filePath.split('/');
  const paths = [];
  for (let index = 1; index < segments.length; index++) {
    paths.push(segments.slice(0, index).join('/'));
  }
  return paths;
}

module.exports = {
  normalizePath,
  parentPaths
};
