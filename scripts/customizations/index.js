/**
 * Trestleboard Customizations
 *
 * Lets a team add personas, overload or override out-of-box personas, and
 * register new document formats (templates) and data files (JSON schemas).
 *
 * Customizations live in a gitignored folder (default config/customizations)
 * and are only used when `customizations.enabled` is true in trestleboard.yaml.
 * Shipped examples live in config/customizations.example.
 */

const path = require('path');
const yaml = require('js-yaml');
const { LocalStorage } = require('../storage');

const SETTINGS_FILE = 'trestleboard.yaml';
const MANIFEST_FILE = 'customizations.yaml';
const DEFAULTS = {
  enabled: false,
  path: 'config/customizations',
  examples_path: 'config/customizations.example'
};

/**
 * Read the customizations block of trestleboard.yaml
 * @param {string} root - Trestleboard root directory
 * @param {object} storage - Storage provider
 * @returns {{enabled: boolean, path: string, examples_path: string}}
 */
function loadSettings(root, storage = new LocalStorage()) {
  const file = path.join(root, SETTINGS_FILE);
  const config = storage.existsSync(file) ? yaml.load(storage.readSync(file)) : null;
  const block = (config && config.customizations) || {};
  return { ...DEFAULTS, ...block, enabled: block.enabled === true };
}

/**
 * Recursively list files under a directory
 */
function walk(dir, storage) {
  if (!storage.existsSync(dir)) return [];
  return storage.listSync(dir).flatMap(entry =>
    storage.isDirectorySync(entry) ? walk(entry, storage) : [entry]
  );
}

/**
 * Work out whether customizations should be used, and what to tell the user
 *
 * state:
 *   off      - disabled, nothing in the folder (out-of-box behaviour, silent)
 *   ignored  - disabled, but customization files exist (warn: being ignored)
 *   missing  - enabled, but no customization files (offer to create them)
 *   active   - enabled and customization files exist
 *
 * @param {string} root - Trestleboard root directory
 * @param {object} storage - Storage provider
 * @returns {{state: string, settings: object, dir: string, files: string[], message: string}}
 */
function getStatus(root, storage = new LocalStorage()) {
  const settings = loadSettings(root, storage);
  const dir = path.resolve(root, settings.path);
  const files = walk(dir, storage).filter(f => path.basename(f) !== '.gitkeep');
  const hasFiles = files.length > 0;

  if (settings.enabled && hasFiles) {
    return { state: 'active', settings, dir, files, message: `Customizations active (${files.length} files in ${settings.path})` };
  }
  if (settings.enabled) {
    return {
      state: 'missing', settings, dir, files,
      message: `Customizations are enabled but ${settings.path} has no files.`
    };
  }
  if (hasFiles) {
    return {
      state: 'ignored', settings, dir, files,
      message: `WARNING: ${files.length} customization file(s) found in ${settings.path}, but customizations are disabled ` +
        `so they are being ignored. Set customizations.enabled: true in ${SETTINGS_FILE} to use them.`
    };
  }
  return { state: 'off', settings, dir, files, message: '' };
}

/**
 * Copy the shipped examples into the customizations folder without
 * overwriting anything that is already there.
 * @returns {string[]} Files created
 */
function initCustomizations(root, storage = new LocalStorage()) {
  const settings = loadSettings(root, storage);
  const source = path.resolve(root, settings.examples_path);
  const target = path.resolve(root, settings.path);
  const created = [];

  for (const file of walk(source, storage)) {
    const dest = path.join(target, path.relative(source, file));
    if (storage.existsSync(dest)) continue;
    storage.mkdirSync(path.dirname(dest));
    storage.writeSync(dest, storage.readSync(file));
    created.push(dest);
  }
  return created;
}

/**
 * Load and validate the customizations manifest
 *
 * Formats register new document templates; data files register new JSON
 * schemas (usable with tb-validate). Referenced files must exist.
 *
 * @returns {{formats: object[], dataFiles: object[], errors: string[]}}
 */
function loadManifest(dir, storage = new LocalStorage()) {
  const file = path.join(dir, MANIFEST_FILE);
  const result = { formats: [], dataFiles: [], errors: [] };
  if (!storage.existsSync(file)) return result;

  let manifest;
  try {
    manifest = yaml.load(storage.readSync(file)) || {};
  } catch (e) {
    result.errors.push(`${file}: invalid YAML: ${e.message}`);
    return result;
  }

  const collect = (key, fileKey, target) => {
    const seen = new Set();
    for (const entry of manifest[key] || []) {
      if (!entry || !entry.id || !entry[fileKey]) {
        result.errors.push(`${MANIFEST_FILE}: each ${key} entry needs an id and a ${fileKey}`);
        continue;
      }
      if (seen.has(entry.id)) {
        result.errors.push(`${MANIFEST_FILE}: duplicate ${key} id '${entry.id}'`);
        continue;
      }
      seen.add(entry.id);
      const resolved = path.resolve(dir, entry[fileKey]);
      if (!storage.existsSync(resolved)) {
        result.errors.push(`${MANIFEST_FILE}: ${key} '${entry.id}' references missing file ${entry[fileKey]}`);
        continue;
      }
      target.push({ ...entry, [fileKey]: resolved });
    }
  };

  collect('formats', 'template', result.formats);
  collect('data_files', 'schema', result.dataFiles);
  return result;
}

/**
 * Everything the other tools need to know about customizations
 * @returns {{status: object, personasDir: string|null, formats: object[], dataFiles: object[], errors: string[]}}
 */
function loadCustomizations(root, storage = new LocalStorage()) {
  const status = getStatus(root, storage);
  if (status.state !== 'active') {
    return { status, personasDir: null, formats: [], dataFiles: [], errors: [] };
  }
  const manifest = loadManifest(status.dir, storage);
  return {
    status,
    personasDir: path.join(status.dir, 'personas'),
    formats: manifest.formats,
    dataFiles: manifest.dataFiles,
    errors: manifest.errors
  };
}

module.exports = { loadSettings, getStatus, initCustomizations, loadManifest, loadCustomizations };
