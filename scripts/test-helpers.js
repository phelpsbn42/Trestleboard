#!/usr/bin/env node

/**
 * Trestleboard Helpers Tests
 *
 * Unit tests for the categorized helpers registry.
 */

const assert = require('assert');
const Handlebars = require('handlebars');

const {
  formatHelpers,
  comparisonHelpers,
  arrayHelpers,
  utilityHelpers,
  markdownHelpers,
  allHelpers,
  registerAllHelpers
} = require('./helpers');

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

// =============================================================================
// Format Helpers Tests
// =============================================================================

describe('formatHelpers', () => {
  test('formatDate formats ISO date', () => {
    assert.strictEqual(formatHelpers.formatDate('2024-01-15'), '2024-01-15');
  });

  test('formatDate returns empty for null', () => {
    assert.strictEqual(formatHelpers.formatDate(null), '');
  });

  test('uppercase converts to uppercase', () => {
    assert.strictEqual(formatHelpers.uppercase('hello'), 'HELLO');
  });

  test('lowercase converts to lowercase', () => {
    assert.strictEqual(formatHelpers.lowercase('HELLO'), 'hello');
  });

  test('capitalize capitalizes first letter', () => {
    assert.strictEqual(formatHelpers.capitalize('hello'), 'Hello');
  });

  test('json stringifies object', () => {
    const result = formatHelpers.json({ a: 1 }, Handlebars);
    assert(result.toString().includes('"a": 1'));
  });
});

// =============================================================================
// Comparison Helpers Tests
// =============================================================================

describe('comparisonHelpers', () => {
  test('eq returns true for equal values', () => {
    assert.strictEqual(comparisonHelpers.eq(1, 1), true);
    assert.strictEqual(comparisonHelpers.eq('a', 'a'), true);
  });

  test('eq returns false for different values', () => {
    assert.strictEqual(comparisonHelpers.eq(1, 2), false);
  });

  test('gt returns true when a > b', () => {
    assert.strictEqual(comparisonHelpers.gt(5, 3), true);
  });

  test('lt returns true when a < b', () => {
    assert.strictEqual(comparisonHelpers.lt(3, 5), true);
  });
});

// =============================================================================
// Array Helpers Tests
// =============================================================================

describe('arrayHelpers', () => {
  test('join joins array with default delimiter', () => {
    assert.strictEqual(arrayHelpers.join(['a', 'b', 'c']), 'a, b, c');
  });

  test('join joins array with custom delimiter', () => {
    assert.strictEqual(arrayHelpers.join(['a', 'b'], '-'), 'a-b');
  });

  test('length returns array length', () => {
    assert.strictEqual(arrayHelpers.length([1, 2, 3]), 3);
  });

  test('length returns 0 for non-array', () => {
    assert.strictEqual(arrayHelpers.length(null), 0);
  });

  test('sum sums array of numbers', () => {
    assert.strictEqual(arrayHelpers.sum([1, 2, 3]), 6);
  });

  test('sum sums property of objects', () => {
    const items = [{ value: 10 }, { value: 20 }];
    assert.strictEqual(arrayHelpers.sum(items, 'value'), 30);
  });

  test('lookup gets property dynamically', () => {
    assert.strictEqual(arrayHelpers.lookup({ name: 'test' }, 'name'), 'test');
  });
});

// =============================================================================
// Utility Helpers Tests
// =============================================================================

describe('utilityHelpers', () => {
  test('inc increments a number', () => {
    assert.strictEqual(utilityHelpers.inc(5), 6);
  });

  test('default returns value when defined', () => {
    assert.strictEqual(utilityHelpers.default('hello', 'default'), 'hello');
  });

  test('default returns default when undefined', () => {
    assert.strictEqual(utilityHelpers.default(undefined, 'default'), 'default');
  });

  test('checkbox returns checked box for true', () => {
    assert.strictEqual(utilityHelpers.checkbox(true), '[x]');
  });

  test('checkbox returns unchecked box for false', () => {
    assert.strictEqual(utilityHelpers.checkbox(false), '[ ]');
  });

  test('riskLevel returns correct level', () => {
    assert.strictEqual(utilityHelpers.riskLevel(20), 'High');
    assert.strictEqual(utilityHelpers.riskLevel(10), 'Medium');
    assert.strictEqual(utilityHelpers.riskLevel(5), 'Low');
  });

  test('pointsBadge returns correct badge', () => {
    assert.strictEqual(utilityHelpers.pointsBadge(1), '🟢');
    assert.strictEqual(utilityHelpers.pointsBadge(8), '🔴');
  });

  test('pluralize returns singular for count 1', () => {
    assert.strictEqual(utilityHelpers.pluralize(1, 'item'), 'item');
  });

  test('pluralize returns plural for count > 1', () => {
    assert.strictEqual(utilityHelpers.pluralize(2, 'item'), 'items');
  });
});

// =============================================================================
// Markdown Helpers Tests
// =============================================================================

describe('markdownHelpers', () => {
  test('mermaid wraps in mermaid code block', () => {
    const block = { fn: () => 'graph TD' };
    const result = markdownHelpers.mermaid.call({}, block);
    assert(result.includes('```mermaid'));
    assert(result.includes('graph TD'));
  });

  test('codeblock wraps in code block with language', () => {
    const block = { fn: () => 'const x = 1;' };
    const result = markdownHelpers.codeblock.call({}, 'javascript', block);
    assert(result.includes('```javascript'));
    assert(result.includes('const x = 1;'));
  });
});

// =============================================================================
// allHelpers Tests
// =============================================================================

describe('allHelpers', () => {
  test('contains all format helpers', () => {
    assert(allHelpers.formatDate);
    assert(allHelpers.uppercase);
    assert(allHelpers.lowercase);
  });

  test('contains all comparison helpers', () => {
    assert(allHelpers.eq);
    assert(allHelpers.gt);
    assert(allHelpers.lt);
  });

  test('contains all array helpers', () => {
    assert(allHelpers.join);
    assert(allHelpers.length);
    assert(allHelpers.sum);
  });

  test('contains all utility helpers', () => {
    assert(allHelpers.inc);
    assert(allHelpers.checkbox);
    assert(allHelpers.riskLevel);
  });

  test('contains all markdown helpers', () => {
    assert(allHelpers.mermaid);
    assert(allHelpers.codeblock);
  });
});

// =============================================================================
// registerAllHelpers Tests
// =============================================================================

describe('registerAllHelpers', () => {
  // Create a fresh Handlebars instance for testing
  const testHandlebars = Handlebars.create();

  test('registers helpers with Handlebars instance', () => {
    registerAllHelpers(testHandlebars);

    // Verify some helpers are registered
    const template = testHandlebars.compile('{{uppercase name}}');
    assert.strictEqual(template({ name: 'test' }), 'TEST');
  });

  test('registered helpers work in templates', () => {
    const template = testHandlebars.compile('{{#if (eq status "active")}}yes{{/if}}');
    assert.strictEqual(template({ status: 'active' }), 'yes');
  });

  test('json helper works with SafeString', () => {
    const template = testHandlebars.compile('{{{json data}}}');
    const result = template({ data: { key: 'value' } });
    assert(result.includes('"key"'));
    assert(result.includes('"value"'));
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log('\n========================================');
console.log('Trestleboard Helpers Tests');
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
