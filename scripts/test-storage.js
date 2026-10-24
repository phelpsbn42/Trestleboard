#!/usr/bin/env node

/**
 * Trestleboard Storage Tests
 *
 * Unit tests for the storage abstraction layer.
 *
 * Usage:
 *   node scripts/test-storage.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the storage module
const { StorageProvider, LocalStorage, defaultStorage } = require('./storage');

// Test utilities
let passCount = 0;
let failCount = 0;
const failures = [];

function test(name, fn) {
  try {
    // Handle async tests
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
  } catch (error) {
    failCount++;
    failures.push({ name, error });
    console.log(`  ✗ ${name}`);
    console.log(`    ${error.message}`);
  }
  return Promise.resolve();
}

function describe(name, fn) {
  console.log(`\n${name}`);
  return fn();
}

// =============================================================================
// StorageProvider Base Class Tests
// =============================================================================

async function runStorageProviderTests() {
  await describe('StorageProvider base class', async () => {
    const provider = new StorageProvider();

    await test('exists() throws not implemented', async () => {
      try {
        await provider.exists('/some/path');
        assert.fail('Should have thrown');
      } catch (e) {
        assert(e.message.includes('must be implemented'));
      }
    });

    await test('read() throws not implemented', async () => {
      try {
        await provider.read('/some/path');
        assert.fail('Should have thrown');
      } catch (e) {
        assert(e.message.includes('must be implemented'));
      }
    });

    await test('write() throws not implemented', async () => {
      try {
        await provider.write('/some/path', 'content');
        assert.fail('Should have thrown');
      } catch (e) {
        assert(e.message.includes('must be implemented'));
      }
    });

    await test('mkdir() throws not implemented', async () => {
      try {
        await provider.mkdir('/some/path');
        assert.fail('Should have thrown');
      } catch (e) {
        assert(e.message.includes('must be implemented'));
      }
    });

    await test('list() throws not implemented', async () => {
      try {
        await provider.list('/some/path');
        assert.fail('Should have thrown');
      } catch (e) {
        assert(e.message.includes('must be implemented'));
      }
    });

    await test('name property returns StorageProvider', () => {
      assert.strictEqual(provider.name, 'StorageProvider');
    });
  });
}

// =============================================================================
// LocalStorage Tests
// =============================================================================

async function runLocalStorageTests() {
  const storage = new LocalStorage();
  const testDir = path.join(os.tmpdir(), `trestleboard-test-${Date.now()}`);
  const testFile = path.join(testDir, 'test-file.txt');
  const testContent = 'Hello, Trestleboard!';

  // Setup
  fs.mkdirSync(testDir, { recursive: true });

  await describe('LocalStorage', async () => {
    await test('name property returns LocalStorage', () => {
      assert.strictEqual(storage.name, 'LocalStorage');
    });

    // Sync methods
    await test('existsSync returns false for non-existent file', () => {
      assert.strictEqual(storage.existsSync('/nonexistent/path'), false);
    });

    await test('existsSync returns true for existing directory', () => {
      assert.strictEqual(storage.existsSync(testDir), true);
    });

    await test('writeSync writes content to file', () => {
      storage.writeSync(testFile, testContent);
      assert.strictEqual(fs.existsSync(testFile), true);
    });

    await test('readSync reads content from file', () => {
      const content = storage.readSync(testFile);
      assert.strictEqual(content, testContent);
    });

    await test('existsSync returns true for existing file', () => {
      assert.strictEqual(storage.existsSync(testFile), true);
    });

    await test('mkdirSync creates nested directories', () => {
      const nestedDir = path.join(testDir, 'a', 'b', 'c');
      storage.mkdirSync(nestedDir);
      assert.strictEqual(fs.existsSync(nestedDir), true);
    });

    // Async methods
    await test('exists() returns false for non-existent file', async () => {
      const result = await storage.exists('/nonexistent/async/path');
      assert.strictEqual(result, false);
    });

    await test('exists() returns true for existing file', async () => {
      const result = await storage.exists(testFile);
      assert.strictEqual(result, true);
    });

    const asyncTestFile = path.join(testDir, 'async-test.txt');
    const asyncContent = 'Async content test';

    await test('write() writes content asynchronously', async () => {
      await storage.write(asyncTestFile, asyncContent);
      assert.strictEqual(fs.existsSync(asyncTestFile), true);
    });

    await test('read() reads content asynchronously', async () => {
      const content = await storage.read(asyncTestFile);
      assert.strictEqual(content, asyncContent);
    });

    await test('mkdir() creates directory asynchronously', async () => {
      const asyncDir = path.join(testDir, 'async-dir', 'nested');
      await storage.mkdir(asyncDir);
      assert.strictEqual(fs.existsSync(asyncDir), true);
    });

    await test('list() returns files in directory', async () => {
      const files = await storage.list(testDir);
      assert(Array.isArray(files));
      assert(files.length > 0);
      assert(files.some(f => f.includes('test-file.txt')));
    });
  });

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
}

// =============================================================================
// Default Storage Export Tests
// =============================================================================

async function runDefaultStorageTests() {
  await describe('defaultStorage export', async () => {
    await test('defaultStorage is a LocalStorage instance', () => {
      assert(defaultStorage instanceof LocalStorage);
    });

    await test('defaultStorage has all required methods', () => {
      assert(typeof defaultStorage.exists === 'function');
      assert(typeof defaultStorage.read === 'function');
      assert(typeof defaultStorage.write === 'function');
      assert(typeof defaultStorage.mkdir === 'function');
      assert(typeof defaultStorage.list === 'function');
    });
  });
}

// =============================================================================
// Mock Storage Tests (demonstrates injection pattern)
// =============================================================================

async function runMockStorageTests() {
  await describe('MockStorage (injection pattern)', async () => {
    // Create a mock storage for testing
    class MockStorage extends StorageProvider {
      constructor() {
        super();
        this.files = new Map();
        this.dirs = new Set();
        this.calls = [];
      }

      async exists(filePath) {
        this.calls.push({ method: 'exists', args: [filePath] });
        return this.files.has(filePath) || this.dirs.has(filePath);
      }

      existsSync(filePath) {
        this.calls.push({ method: 'existsSync', args: [filePath] });
        return this.files.has(filePath) || this.dirs.has(filePath);
      }

      async read(filePath) {
        this.calls.push({ method: 'read', args: [filePath] });
        if (!this.files.has(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        return this.files.get(filePath);
      }

      readSync(filePath) {
        this.calls.push({ method: 'readSync', args: [filePath] });
        if (!this.files.has(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        return this.files.get(filePath);
      }

      async write(filePath, content) {
        this.calls.push({ method: 'write', args: [filePath, content] });
        this.files.set(filePath, content);
      }

      writeSync(filePath, content) {
        this.calls.push({ method: 'writeSync', args: [filePath, content] });
        this.files.set(filePath, content);
      }

      async mkdir(dirPath) {
        this.calls.push({ method: 'mkdir', args: [dirPath] });
        this.dirs.add(dirPath);
      }

      mkdirSync(dirPath) {
        this.calls.push({ method: 'mkdirSync', args: [dirPath] });
        this.dirs.add(dirPath);
      }

      async list(dirPath) {
        this.calls.push({ method: 'list', args: [dirPath] });
        return Array.from(this.files.keys()).filter(f => f.startsWith(dirPath));
      }

      get name() {
        return 'MockStorage';
      }
    }

    await test('MockStorage can be instantiated', () => {
      const mock = new MockStorage();
      assert.strictEqual(mock.name, 'MockStorage');
    });

    await test('MockStorage tracks method calls', async () => {
      const mock = new MockStorage();
      await mock.exists('/test/path');
      await mock.write('/test/file', 'content');
      await mock.read('/test/file');

      assert.strictEqual(mock.calls.length, 3);
      assert.strictEqual(mock.calls[0].method, 'exists');
      assert.strictEqual(mock.calls[1].method, 'write');
      assert.strictEqual(mock.calls[2].method, 'read');
    });

    await test('MockStorage stores and retrieves files', async () => {
      const mock = new MockStorage();
      await mock.write('/my/file.txt', 'hello world');
      const content = await mock.read('/my/file.txt');
      assert.strictEqual(content, 'hello world');
    });

    await test('MockStorage tracks directories', async () => {
      const mock = new MockStorage();
      await mock.mkdir('/my/dir');
      assert.strictEqual(await mock.exists('/my/dir'), true);
      assert.strictEqual(await mock.exists('/other/dir'), false);
    });

    await test('MockStorage extends StorageProvider', () => {
      const mock = new MockStorage();
      assert(mock instanceof StorageProvider);
    });
  });
}

// =============================================================================
// Integration Tests (storage injection in render/validate/init)
// =============================================================================

async function runInjectionTests() {
  const { resolveTemplatePath, resolveProjectPaths } = require('./render.js');
  const { loadSchema } = require('./validate.js');
  const { initProject } = require('./init-project.js');

  // Mock keys are POSIX-style; normalize so path.join output on Windows matches
  const norm = p => p.replace(/\\/g, '/');

  // Create a mock storage
  class MockStorage extends StorageProvider {
    constructor() {
      super();
      this.files = new Map();
      this.dirs = new Set();
    }

    async exists(p) { return this.existsSync(p); }
    existsSync(p) { return this.files.has(norm(p)) || this.dirs.has(norm(p)); }
    async read(p) { return this.readSync(p); }
    readSync(p) { return this.files.get(norm(p)); }
    async write(p, c) { this.writeSync(p, c); }
    writeSync(p, c) { this.files.set(norm(p), c); }
    async mkdir(p) { this.mkdirSync(p); }
    mkdirSync(p) { this.dirs.add(norm(p)); }
    async list(p) { return Array.from(this.files.keys()).filter(f => f.startsWith(norm(p))); }
    get name() { return 'MockStorage'; }
  }

  await describe('Storage injection in render.js', async () => {
    await test('resolveTemplatePath uses injected storage', () => {
      const mock = new MockStorage();
      mock.files.set('/custom/template.md', '# Template');

      const result = resolveTemplatePath('/custom/template.md', '/cwd', mock);
      assert.strictEqual(norm(result.templatePath), '/custom/template.md');
      assert.strictEqual(result.error, undefined);
    });

    await test('resolveTemplatePath returns error when file not in mock', () => {
      const mock = new MockStorage();
      const result = resolveTemplatePath('/missing/template.md', '/cwd', mock);
      assert(result.error.includes('not found'));
    });

    await test('resolveProjectPaths uses injected storage', () => {
      const mock = new MockStorage();
      mock.dirs.add('/cwd/projects/my-project');
      mock.files.set('/cwd/projects/my-project/output/data.json', '{}');

      const result = resolveProjectPaths('data.json', 'my-project', '/cwd', mock);
      assert.strictEqual(result.error, undefined);
      assert.strictEqual(norm(result.projectDir), '/cwd/projects/my-project');
    });

    await test('resolveProjectPaths returns error for missing project', () => {
      const mock = new MockStorage();
      const result = resolveProjectPaths('data.json', 'missing-project', '/cwd', mock);
      assert(result.error.includes('not found'));
    });
  });

  await describe('Storage injection in validate.js', async () => {
    await test('loadSchema uses injected storage', () => {
      const mock = new MockStorage();
      const schemaContent = JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object'
      });
      mock.files.set('/schemas/project-meta.schema.json', schemaContent);

      const result = loadSchema('project-meta', '/schemas', mock);
      assert.strictEqual(result.error, undefined);
      assert.strictEqual(result.schema.type, 'object');
    });

    await test('loadSchema returns error when schema not in mock', () => {
      const mock = new MockStorage();
      const result = loadSchema('project-meta', '/schemas', mock);
      assert(result.error.includes('not found'));
    });
  });

  await describe('Storage injection in init-project.js', async () => {
    await test('initProject uses injected storage', async () => {
      const mock = new MockStorage();

      const result = await initProject('test-project', {
        description: 'Test',
        cwd: '/workspace'
      }, mock);

      assert.strictEqual(result.error, undefined);
      assert.strictEqual(norm(result.projectDir), '/workspace/projects/test-project');

      // Verify files were written to mock storage
      assert(mock.files.has('/workspace/projects/test-project/project.json'));
      assert(mock.files.has('/workspace/projects/test-project/README.md'));
      assert(mock.files.has('/workspace/projects/test-project/input/.gitkeep'));
      assert(mock.files.has('/workspace/projects/test-project/output/.gitkeep'));
    });

    await test('initProject returns error if project exists in mock', async () => {
      const mock = new MockStorage();
      mock.dirs.add('/workspace/projects/existing-project');

      const result = await initProject('existing-project', {
        cwd: '/workspace'
      }, mock);

      assert(result.error.includes('already exists'));
    });

    await test('initProject creates correct metadata', async () => {
      const mock = new MockStorage();

      await initProject('my-app', {
        description: 'My application',
        cwd: '/workspace'
      }, mock);

      const metadataJson = mock.files.get('/workspace/projects/my-app/project.json');
      const metadata = JSON.parse(metadataJson);

      assert.strictEqual(metadata.project_name, 'my-app');
      assert.strictEqual(metadata.display_name, 'My App');
      assert.strictEqual(metadata.description, 'My application');
      assert.strictEqual(metadata.status, 'inception');
    });
  });
}

// =============================================================================
// Run All Tests
// =============================================================================

async function runAllTests() {
  console.log('========================================');
  console.log('Trestleboard Storage Tests');
  console.log('========================================');

  await runStorageProviderTests();
  await runLocalStorageTests();
  await runDefaultStorageTests();
  await runMockStorageTests();
  await runInjectionTests();

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
