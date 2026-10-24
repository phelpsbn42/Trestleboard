#!/usr/bin/env node

/**
 * Trestleboard Persona Tests
 *
 * Unit tests for persona front matter parsing, overload merging and
 * persona resolution (add / override / overload).
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { parseFrontMatter, serializeFrontMatter, splitSections, applyOverload, resolvePersonas } = require('./personas');

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

function persona(id, mode, body, extra = '') {
  return `---\npersona:\n  id: ${id}\n  name: ${id}\n  mode: ${mode}\n${extra}---\n${body}`;
}

function makeDirs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-personas-'));
  const baseDir = path.join(root, 'base');
  const customDir = path.join(root, 'custom');
  fs.mkdirSync(baseDir);
  fs.mkdirSync(customDir);
  return { root, baseDir, customDir };
}

const BASE_BODY = '# Alpha Persona\n\nIntro\n\n## Core Principles\n\n1. One\n\n## Remember\n\n- Base remember\n';

// =============================================================================
// Front matter
// =============================================================================

describe('parseFrontMatter', () => {
  test('parses the persona block and body', () => {
    const { data, body, error } = parseFrontMatter(persona('alpha', 'base', '# Alpha Persona\n'));
    assert.strictEqual(error, undefined);
    assert.strictEqual(data.persona.id, 'alpha');
    assert.strictEqual(body, '# Alpha Persona\n');
  });

  test('handles CRLF line endings', () => {
    const { data } = parseFrontMatter(persona('alpha', 'base', '# A\n').replace(/\n/g, '\r\n'));
    assert.strictEqual(data.persona.id, 'alpha');
  });

  test('reports missing front matter', () => {
    const { data, error } = parseFrontMatter('# No front matter\n');
    assert.strictEqual(data, null);
    assert(error.includes('Missing front matter'));
  });

  test('reports invalid YAML', () => {
    const { error } = parseFrontMatter('---\npersona: [unclosed\n---\n# x\n');
    assert(error.includes('Invalid front matter YAML'));
  });

  test('serializeFrontMatter round-trips', () => {
    const text = serializeFrontMatter({ persona: { id: 'alpha', mode: 'base' } }, '# Body\n');
    const { data, body } = parseFrontMatter(text);
    assert.strictEqual(data.persona.id, 'alpha');
    assert.strictEqual(body, '# Body\n');
  });
});

// =============================================================================
// Sections and overloads
// =============================================================================

describe('splitSections', () => {
  test('splits on level-2 headings', () => {
    const { preamble, sections } = splitSections(BASE_BODY);
    assert(preamble.includes('# Alpha Persona'));
    assert.deepStrictEqual(sections.map(s => s.title), ['Core Principles', 'Remember']);
  });

  test('ignores headings inside code fences', () => {
    const { sections } = splitSections('# T\n\n## Real\n\n```\n## Not a heading\n```\n');
    assert.deepStrictEqual(sections.map(s => s.title), ['Real']);
  });
});

describe('applyOverload', () => {
  test('replaces a section by default', () => {
    const merged = applyOverload(BASE_BODY, '## Remember\n\n- New remember\n');
    assert(merged.includes('- New remember'));
    assert(!merged.includes('- Base remember'));
    assert(merged.includes('1. One'));
  });

  test('appends to a section', () => {
    const merged = applyOverload(BASE_BODY, '## Core Principles\n\n2. Two\n', { 'Core Principles': 'append' });
    assert(merged.indexOf('1. One') < merged.indexOf('2. Two'));
  });

  test('prepends to a section', () => {
    const merged = applyOverload(BASE_BODY, '## Core Principles\n\n0. Zero\n', { 'Core Principles': 'prepend' });
    assert(merged.indexOf('0. Zero') < merged.indexOf('1. One'));
  });

  test('adds new sections at the end', () => {
    const merged = applyOverload(BASE_BODY, '## Extra\n\nMore\n');
    assert(merged.indexOf('## Extra') > merged.indexOf('## Remember'));
  });
});

// =============================================================================
// resolvePersonas
// =============================================================================

describe('resolvePersonas', () => {
  test('loads base personas and skips README and underscore files', () => {
    const { baseDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'alpha.md'), persona('alpha', 'base', BASE_BODY));
    fs.writeFileSync(path.join(baseDir, 'README.md'), '# Readme');
    fs.writeFileSync(path.join(baseDir, '_example.md'), persona('example', 'add', BASE_BODY));
    const { personas, errors } = resolvePersonas({ baseDir });
    assert.deepStrictEqual([...personas.keys()], ['alpha']);
    assert.deepStrictEqual(errors, []);
  });

  test('reports a file without a persona block', () => {
    const { baseDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'bad.md'), '---\ntitle: nope\n---\n# Bad\n');
    const { errors } = resolvePersonas({ baseDir });
    assert(errors[0].includes('missing a `persona` block'));
  });

  test('adds a new custom persona', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'alpha.md'), persona('alpha', 'base', BASE_BODY));
    fs.writeFileSync(path.join(customDir, 'beta.md'), persona('beta', 'add', '# Beta Persona\n'));
    const { personas, errors } = resolvePersonas({ baseDir, customDir });
    assert.deepStrictEqual(errors, []);
    assert.strictEqual(personas.get('beta').mode, 'add');
  });

  test('add is the default mode when none is given', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(customDir, 'beta.md'), '---\npersona:\n  id: beta\n---\n# Beta Persona\n');
    const { personas } = resolvePersonas({ baseDir, customDir });
    assert.strictEqual(personas.get('beta').mode, 'add');
  });

  test('rejects adding a persona whose id already exists', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'alpha.md'), persona('alpha', 'base', BASE_BODY));
    fs.writeFileSync(path.join(customDir, 'alpha.md'), persona('alpha', 'add', '# Alpha Persona\n'));
    const { personas, errors } = resolvePersonas({ baseDir, customDir });
    assert(errors[0].includes('already exists'));
    assert.strictEqual(personas.get('alpha').mode, 'base');
  });

  test('override replaces the base persona', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'alpha.md'), persona('alpha', 'base', BASE_BODY));
    fs.writeFileSync(path.join(customDir, 'alpha.md'), persona('alpha', 'override', '# Alpha Persona\n\n## Only\n'));
    const { personas, errors } = resolvePersonas({ baseDir, customDir });
    assert.deepStrictEqual(errors, []);
    assert.strictEqual(personas.get('alpha').mode, 'override');
    assert(!personas.get('alpha').body.includes('Core Principles'));
  });

  test('overload merges into the base persona and keeps base metadata', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'alpha.md'), persona('alpha', 'base', BASE_BODY, '  phase: discovery\n'));
    fs.writeFileSync(
      path.join(customDir, 'alpha.md'),
      persona('alpha', 'overload', '## Core Principles\n\n2. Two\n', '  sections:\n    Core Principles: append\n')
    );
    const { personas, errors } = resolvePersonas({ baseDir, customDir });
    assert.deepStrictEqual(errors, []);
    const merged = personas.get('alpha');
    assert.strictEqual(merged.mode, 'overload');
    assert.strictEqual(merged.meta.phase, 'discovery');
    assert.strictEqual(merged.meta.mode, 'base');
    assert(merged.body.includes('1. One') && merged.body.includes('2. Two'));
  });

  test('rejects override and overload of an unknown persona', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(customDir, 'ghost.md'), persona('ghost', 'overload', '## X\n'));
    const { errors } = resolvePersonas({ baseDir, customDir });
    assert(errors[0].includes("cannot overload unknown persona 'ghost'"));
  });

  test('rejects an invalid mode and an invalid section strategy', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(baseDir, 'alpha.md'), persona('alpha', 'base', BASE_BODY));
    fs.writeFileSync(path.join(customDir, 'a.md'), persona('alpha', 'weird', '## X\n'));
    fs.writeFileSync(
      path.join(customDir, 'b.md'),
      persona('alpha', 'overload', '## X\n', '  sections:\n    X: shuffle\n')
    );
    const { errors } = resolvePersonas({ baseDir, customDir });
    assert(errors.some(e => e.includes("invalid mode 'weird'")));
    assert(errors.some(e => e.includes("invalid strategy 'shuffle'")));
  });

  test('ignores the custom directory when none is supplied', () => {
    const { baseDir, customDir } = makeDirs();
    fs.writeFileSync(path.join(customDir, 'beta.md'), persona('beta', 'add', '# Beta Persona\n'));
    const { personas } = resolvePersonas({ baseDir });
    assert(!personas.has('beta'));
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log('\n========================================');
console.log('Trestleboard Persona Tests');
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
