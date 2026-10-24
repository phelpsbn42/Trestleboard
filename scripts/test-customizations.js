#!/usr/bin/env node

/**
 * Trestleboard Customizations and Lint Tests
 *
 * Tests customization status (off / ignored / missing / active), example
 * initialization, manifest loading, and the consistency linter.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { getStatus, initCustomizations, loadCustomizations, loadManifest } = require('./customizations');
const { lint } = require('./lint');
const { loadSchema } = require('./validate');

// Test utilities
let passCount = 0;
let failCount = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passCount++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failCount++;
    failures.push({ name, error });
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

const REAL_ROOT = path.join(__dirname, '..');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Build a throwaway Trestleboard root with the real examples */
function makeRoot({ enabled }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-custom-'));
  write(path.join(root, 'trestleboard.yaml'), `customizations:\n  enabled: ${enabled}\n`);
  fs.cpSync(path.join(REAL_ROOT, 'config', 'customizations.example'), path.join(root, 'config', 'customizations.example'), { recursive: true });
  return root;
}

/** Copy the real personas, templates, schemas and config into a root */
function makeFullRoot({ enabled }) {
  const root = makeRoot({ enabled });
  for (const dir of ['personas', 'templates', 'schemas']) {
    fs.cpSync(path.join(REAL_ROOT, dir), path.join(root, dir), { recursive: true });
  }
  const real = fs.readFileSync(path.join(REAL_ROOT, 'trestleboard.yaml'), 'utf8')
    .replace(/enabled: (true|false)/, `enabled: ${enabled}`);
  write(path.join(root, 'trestleboard.yaml'), real);
  return root;
}

// =============================================================================
// Status
// =============================================================================

describe('getStatus', () => {
  test('off: disabled and no files is silent', () => {
    const status = getStatus(makeRoot({ enabled: false }));
    assert.strictEqual(status.state, 'off');
    assert.strictEqual(status.message, '');
  });

  test('ignored: disabled but files exist warns', () => {
    const root = makeRoot({ enabled: false });
    write(path.join(root, 'config', 'customizations', 'personas', 'x.md'), '# x');
    const status = getStatus(root);
    assert.strictEqual(status.state, 'ignored');
    assert(status.message.includes('being ignored'));
  });

  test('missing: enabled but no files', () => {
    const status = getStatus(makeRoot({ enabled: true }));
    assert.strictEqual(status.state, 'missing');
  });

  test('active: enabled with files', () => {
    const root = makeRoot({ enabled: true });
    write(path.join(root, 'config', 'customizations', 'personas', 'x.md'), '# x');
    assert.strictEqual(getStatus(root).state, 'active');
  });

  test('a .gitkeep alone does not count as customizations', () => {
    const root = makeRoot({ enabled: true });
    write(path.join(root, 'config', 'customizations', '.gitkeep'), '');
    assert.strictEqual(getStatus(root).state, 'missing');
  });

  test('defaults to disabled without a settings file', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-custom-'));
    assert.strictEqual(getStatus(root).state, 'off');
  });
});

// =============================================================================
// Init
// =============================================================================

describe('initCustomizations', () => {
  test('copies the shipped examples', () => {
    const root = makeRoot({ enabled: true });
    const created = initCustomizations(root);
    assert(created.length > 0);
    assert(fs.existsSync(path.join(root, 'config', 'customizations', 'customizations.yaml')));
    assert(fs.existsSync(path.join(root, 'config', 'customizations', 'personas', '_new-persona.example.md')));
  });

  test('never overwrites existing files', () => {
    const root = makeRoot({ enabled: true });
    const manifest = path.join(root, 'config', 'customizations', 'customizations.yaml');
    write(manifest, 'formats: []\n# mine\n');
    initCustomizations(root);
    assert(fs.readFileSync(manifest, 'utf8').includes('# mine'));
  });

  test('shipped examples are inert until renamed', () => {
    const root = makeRoot({ enabled: true });
    initCustomizations(root);
    const custom = loadCustomizations(root);
    assert.strictEqual(custom.status.state, 'active');
    assert.deepStrictEqual(custom.errors, []);
    assert.deepStrictEqual(custom.formats, []);
    assert.deepStrictEqual(custom.dataFiles, []);
  });
});

// =============================================================================
// Manifest
// =============================================================================

describe('loadManifest', () => {
  test('resolves formats and data files', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-manifest-'));
    write(path.join(dir, 'templates', 'r.md'), '# r');
    write(path.join(dir, 'schemas', 'r.schema.json'), '{}');
    write(path.join(dir, 'customizations.yaml'),
      'formats:\n  - id: r\n    template: templates/r.md\ndata_files:\n  - id: r\n    schema: schemas/r.schema.json\n');
    const manifest = loadManifest(dir);
    assert.deepStrictEqual(manifest.errors, []);
    assert.strictEqual(manifest.formats[0].template, path.join(dir, 'templates', 'r.md'));
    assert.strictEqual(manifest.dataFiles[0].id, 'r');
  });

  test('reports missing files, missing fields and duplicates', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-manifest-'));
    write(path.join(dir, 't.md'), '# t');
    write(path.join(dir, 'customizations.yaml'),
      'formats:\n  - id: a\n    template: nope.md\n  - id: b\n  - id: t\n    template: t.md\n  - id: t\n    template: t.md\n');
    const { errors } = loadManifest(dir);
    assert(errors.some(e => e.includes('missing file nope.md')));
    assert(errors.some(e => e.includes('needs an id and a template')));
    assert(errors.some(e => e.includes("duplicate formats id 't'")));
  });

  test('reports invalid YAML', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-manifest-'));
    write(path.join(dir, 'customizations.yaml'), 'formats: [oops\n');
    assert(loadManifest(dir).errors[0].includes('invalid YAML'));
  });
});

// =============================================================================
// Lint
// =============================================================================

describe('lint', () => {
  test('the real Trestleboard passes', () => {
    const result = lint(REAL_ROOT);
    assert.deepStrictEqual(result.errors, []);
    assert(result.personas.includes('quality'));
  });

  test('flags a persona missing a required section', () => {
    const root = makeFullRoot({ enabled: false });
    const file = path.join(root, 'personas', 'analyst.md');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/## Remember[\s\S]*$/, ''));
    const { errors } = lint(root);
    assert(errors.some(e => e.includes("missing required section 'Remember'")));
  });

  test('flags a persona that is not listed in trestleboard.yaml', () => {
    const root = makeFullRoot({ enabled: false });
    const file = path.join(root, 'trestleboard.yaml');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/ +- quality\r?\n/, ''));
    assert(lint(root).errors.some(e => e.includes("'quality' is not listed")));
  });

  test('flags a front matter id that does not match the file name', () => {
    const root = makeFullRoot({ enabled: false });
    fs.renameSync(path.join(root, 'personas', 'quality.md'), path.join(root, 'personas', 'qa.md'));
    const { errors } = lint(root);
    assert(errors.some(e => e.includes("does not match the file name")));
  });

  test('flags a missing referenced template', () => {
    const root = makeFullRoot({ enabled: false });
    fs.rmSync(path.join(root, 'templates', 'quality'), { recursive: true });
    assert(lint(root).errors.some(e => e.includes('references missing template')));
  });

  test('warns when customizations exist but are disabled', () => {
    const root = makeFullRoot({ enabled: false });
    write(path.join(root, 'config', 'customizations', 'personas', 'x.md'), '# x');
    const { warnings, errors } = lint(root);
    assert.deepStrictEqual(errors, []);
    assert(warnings[0].includes('being ignored'));
  });

  test('accepts a valid custom persona and overload when enabled', () => {
    const root = makeFullRoot({ enabled: true });
    initCustomizations(root);
    const dir = path.join(root, 'config', 'customizations', 'personas');
    fs.copyFileSync(path.join(dir, '_new-persona.example.md'), path.join(dir, 'security-reviewer.md'));
    fs.copyFileSync(path.join(dir, '_overload-analyst.example.md'), path.join(dir, 'analyst.md'));
    const result = lint(root);
    assert.deepStrictEqual(result.errors, []);
    assert(result.personas.includes('security-reviewer'));
  });

  test('flags a custom persona that duplicates a built-in id', () => {
    const root = makeFullRoot({ enabled: true });
    write(path.join(root, 'config', 'customizations', 'personas', 'analyst.md'),
      '---\npersona:\n  id: analyst\n  mode: add\n---\n# Analyst Persona\n');
    assert(lint(root).errors.some(e => e.includes('already exists')));
  });

  test('flags a custom data file that collides with a built-in schema', () => {
    const root = makeFullRoot({ enabled: true });
    const dir = path.join(root, 'config', 'customizations');
    write(path.join(dir, 's.json'), '{}');
    write(path.join(dir, 'customizations.yaml'), 'data_files:\n  - id: quality\n    schema: s.json\n');
    assert(lint(root).errors.some(e => e.includes('collides with a built-in schema')));
  });
});

describe('custom data files', () => {
  test('loadSchema resolves a custom schema id', () => {
    const file = path.join(REAL_ROOT, 'config', 'customizations.example', 'schemas', '_runbook.example.schema.json');
    const result = loadSchema('runbook', path.join(REAL_ROOT, 'schemas'), undefined, { runbook: file });
    assert.strictEqual(result.error, undefined);
    assert.strictEqual(result.schema.title, 'Runbook');
  });

  test('loadSchema rejects unknown ids and lists custom ones', () => {
    const result = loadSchema('nope', path.join(REAL_ROOT, 'schemas'), undefined, { runbook: 'x' });
    assert(result.error.includes('runbook') && result.error.includes('quality'));
  });

  test('a built-in id is never redirected to a custom file', () => {
    const result = loadSchema('quality', path.join(REAL_ROOT, 'schemas'), undefined, { quality: 'elsewhere.json' });
    assert.strictEqual(result.schema.title, 'Quality');
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log('\n========================================');
console.log('Trestleboard Customizations Tests');
console.log('========================================');

console.log(`\n========================================`);
console.log(`Results: ${passCount} passed, ${failCount} failed`);
console.log('========================================\n');

if (failCount > 0) {
  console.log('Failures:');
  for (const { name, error } of failures) {
    console.log(`\n  ${name}:`);
    console.log(`    ${error.stack || error.message}`);
  }
  process.exit(1);
} else {
  console.log('All tests passed!');
}
