#!/usr/bin/env node

/**
 * Trestleboard CLI Integration Tests
 *
 * Tests for the main() functions with mock storage.
 */

const assert = require('assert');
const { StorageProvider } = require('./storage');

// Test utilities
let passCount = 0;
let failCount = 0;
const failures = [];

function test(name, fn) {
  const result = fn();
  if (result && typeof result.then === 'function') {
    return result
      .then(() => {
        passCount++;
        console.log(`  ✓ ${name}`);
      })
      .catch(error => {
        failCount++;
        failures.push({ name, error });
        console.log(`  ✗ ${name}`);
        console.log(`    ${error.message}`);
      });
  }
  passCount++;
  console.log(`  ✓ ${name}`);
  return Promise.resolve();
}

function describe(name, fn) {
  console.log(`\n${name}`);
  return fn();
}

// =============================================================================
// Mock Storage for CLI Tests
// =============================================================================

class MockStorage extends StorageProvider {
  constructor() {
    super();
    this.files = new Map();
    this.dirs = new Set();
    this.operations = [];
  }

  async exists(p) {
    this.operations.push({ op: 'exists', path: p });
    return this.files.has(p) || this.dirs.has(p);
  }

  existsSync(p) {
    this.operations.push({ op: 'existsSync', path: p });
    return this.files.has(p) || this.dirs.has(p);
  }

  async read(p) {
    this.operations.push({ op: 'read', path: p });
    if (!this.files.has(p)) throw new Error(`File not found: ${p}`);
    return this.files.get(p);
  }

  readSync(p) {
    this.operations.push({ op: 'readSync', path: p });
    if (!this.files.has(p)) throw new Error(`File not found: ${p}`);
    return this.files.get(p);
  }

  async write(p, content) {
    this.operations.push({ op: 'write', path: p });
    this.files.set(p, content);
  }

  writeSync(p, content) {
    this.operations.push({ op: 'writeSync', path: p });
    this.files.set(p, content);
  }

  async mkdir(p) {
    this.operations.push({ op: 'mkdir', path: p });
    this.dirs.add(p);
  }

  mkdirSync(p) {
    this.operations.push({ op: 'mkdirSync', path: p });
    this.dirs.add(p);
  }

  async list(p) {
    return Array.from(this.files.keys()).filter(f => f.startsWith(p));
  }

  get name() { return 'MockStorage'; }
}

// =============================================================================
// Render CLI Tests
// =============================================================================

async function runRenderCliTests() {
  const { main, registerHelpers, Handlebars } = require('./render');

  // Register helpers once
  registerHelpers();

  await describe('render.js main()', async () => {
    await test('renders template and writes to output', async () => {
      const mock = new MockStorage();
      mock.files.set('/template.md', '# {{title}}\n\n{{content}}');
      mock.files.set('/data.json', JSON.stringify({ title: 'Test', content: 'Hello' }));
      mock.dirs.add('/output');

      // Suppress console.log for this test
      const originalLog = console.log;
      console.log = () => {};

      try {
        await main({
          template: '/template.md',
          data: '/data.json',
          output: '/output/result.md'
        }, mock);
      } finally {
        console.log = originalLog;
      }

      assert(mock.files.has('/output/result.md'));
      const output = mock.files.get('/output/result.md');
      assert(output.includes('# Test'));
      assert(output.includes('Hello'));
    });

    await test('adds generated_date to output', async () => {
      const mock = new MockStorage();
      mock.files.set('/template.md', 'Date: {{generated_date}}');
      mock.files.set('/data.json', '{}');
      mock.dirs.add('/output');

      const originalLog = console.log;
      console.log = () => {};

      try {
        await main({
          template: '/template.md',
          data: '/data.json',
          output: '/output/result.md'
        }, mock);
      } finally {
        console.log = originalLog;
      }

      const output = mock.files.get('/output/result.md');
      // Should contain a date in YYYY-MM-DD format
      assert(/Date: \d{4}-\d{2}-\d{2}/.test(output));
    });

    await test('creates output directory if missing', async () => {
      const mock = new MockStorage();
      mock.files.set('/template.md', '# Test');
      mock.files.set('/data.json', '{}');
      // Note: /new-output directory doesn't exist

      const originalLog = console.log;
      console.log = () => {};

      try {
        await main({
          template: '/template.md',
          data: '/data.json',
          output: '/new-output/result.md'
        }, mock);
      } finally {
        console.log = originalLog;
      }

      // Should have created the directory
      assert(mock.dirs.has('/new-output'));
      assert(mock.files.has('/new-output/result.md'));
    });

    await test('registers and uses partials', async () => {
      const mock = new MockStorage();
      mock.files.set('/template.md', '{{> header}}\nContent');
      mock.files.set('/data.json', '{}');
      mock.files.set('/partials/header.md', '# Header Partial');
      mock.dirs.add('/output');

      const originalLog = console.log;
      console.log = () => {};

      try {
        await main({
          template: '/template.md',
          data: '/data.json',
          output: '/output/result.md',
          partial: ['/partials/header.md']
        }, mock);
      } finally {
        console.log = originalLog;
      }

      const output = mock.files.get('/output/result.md');
      assert(output.includes('# Header Partial'));
    });

    await test('uses helpers in template', async () => {
      const mock = new MockStorage();
      mock.files.set('/template.md', '{{uppercase name}}');
      mock.files.set('/data.json', JSON.stringify({ name: 'test' }));
      mock.dirs.add('/output');

      const originalLog = console.log;
      console.log = () => {};

      try {
        await main({
          template: '/template.md',
          data: '/data.json',
          output: '/output/result.md'
        }, mock);
      } finally {
        console.log = originalLog;
      }

      const output = mock.files.get('/output/result.md');
      assert.strictEqual(output, 'TEST');
    });
  });
}

// =============================================================================
// Validate CLI Tests
// =============================================================================

async function runValidateCliTests() {
  const { main, loadSchema } = require('./validate');

  await describe('validate.js loadSchema()', async () => {
    await test('loads schema from mock storage', () => {
      const mock = new MockStorage();
      const schema = { type: 'object', properties: {} };
      mock.files.set('/schemas/project-meta.schema.json', JSON.stringify(schema));

      const result = loadSchema('project-meta', '/schemas', mock);
      assert.strictEqual(result.error, undefined);
      assert.strictEqual(result.schema.type, 'object');
    });

    await test('returns error for invalid schema type', () => {
      const mock = new MockStorage();
      const result = loadSchema('invalid-type', '/schemas', mock);
      assert(result.error.includes('Invalid schema type'));
    });

    await test('returns error for missing schema file', () => {
      const mock = new MockStorage();
      const result = loadSchema('project-meta', '/schemas', mock);
      assert(result.error.includes('not found'));
    });
  });
}

// =============================================================================
// Init CLI Tests
// =============================================================================

async function runInitCliTests() {
  const { initProject } = require('./init-project');

  await describe('init-project.js initProject()', async () => {
    await test('creates all required files and directories', async () => {
      const mock = new MockStorage();

      const result = await initProject('my-project', {
        description: 'Test project',
        cwd: '/workspace'
      }, mock);

      assert.strictEqual(result.error, undefined);

      // Check directories
      assert(mock.dirs.has('/workspace/projects/my-project/input'));
      assert(mock.dirs.has('/workspace/projects/my-project/output'));

      // Check files
      assert(mock.files.has('/workspace/projects/my-project/project.json'));
      assert(mock.files.has('/workspace/projects/my-project/README.md'));
      assert(mock.files.has('/workspace/projects/my-project/input/.gitkeep'));
      assert(mock.files.has('/workspace/projects/my-project/output/.gitkeep'));
    });

    await test('creates valid project.json metadata', async () => {
      const mock = new MockStorage();

      await initProject('test-app', {
        description: 'My app description',
        cwd: '/workspace'
      }, mock);

      const metadataJson = mock.files.get('/workspace/projects/test-app/project.json');
      const metadata = JSON.parse(metadataJson);

      assert.strictEqual(metadata.project_name, 'test-app');
      assert.strictEqual(metadata.display_name, 'Test App');
      assert.strictEqual(metadata.description, 'My app description');
      assert.strictEqual(metadata.status, 'inception');
      assert(Array.isArray(metadata.team));
      assert(metadata.artifacts);
    });

    await test('creates README with project info', async () => {
      const mock = new MockStorage();

      await initProject('my-readme-test', {
        description: 'A test description',
        cwd: '/workspace'
      }, mock);

      const readme = mock.files.get('/workspace/projects/my-readme-test/README.md');

      assert(readme.includes('# My Readme Test'));
      assert(readme.includes('A test description'));
      assert(readme.includes('Phase'));
    });

    await test('returns error if project exists', async () => {
      const mock = new MockStorage();
      mock.dirs.add('/workspace/projects/existing');

      const result = await initProject('existing', { cwd: '/workspace' }, mock);

      assert(result.error);
      assert(result.error.includes('already exists'));
    });

    await test('handles missing description', async () => {
      const mock = new MockStorage();

      const result = await initProject('no-desc', { cwd: '/workspace' }, mock);

      assert.strictEqual(result.error, undefined);
      const metadata = JSON.parse(mock.files.get('/workspace/projects/no-desc/project.json'));
      assert.strictEqual(metadata.description, '');
    });
  });
}

// =============================================================================
// Run All Tests
// =============================================================================

async function runAllTests() {
  console.log('========================================');
  console.log('Trestleboard CLI Integration Tests');
  console.log('========================================');

  await runRenderCliTests();
  await runValidateCliTests();
  await runInitCliTests();

  console.log('\n========================================');
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
}

runAllTests();
