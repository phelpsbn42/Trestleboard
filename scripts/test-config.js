#!/usr/bin/env node

/**
 * Trestleboard Config Tests
 *
 * Unit tests for the configuration module.
 */

const assert = require('assert');

const {
  RISK_THRESHOLDS,
  POINT_BADGES,
  SCHEMA_TYPES,
  PROJECT_DIRECTORIES,
  PROJECT_STATUSES,
  getRiskLevel,
  getPointsBadge
} = require('./config');

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
// RISK_THRESHOLDS Tests
// =============================================================================

describe('RISK_THRESHOLDS', () => {
  test('has high threshold', () => {
    assert.strictEqual(typeof RISK_THRESHOLDS.high, 'number');
    assert.strictEqual(RISK_THRESHOLDS.high, 15);
  });

  test('has medium threshold', () => {
    assert.strictEqual(typeof RISK_THRESHOLDS.medium, 'number');
    assert.strictEqual(RISK_THRESHOLDS.medium, 8);
  });

  test('high > medium', () => {
    assert(RISK_THRESHOLDS.high > RISK_THRESHOLDS.medium);
  });
});

// =============================================================================
// POINT_BADGES Tests
// =============================================================================

describe('POINT_BADGES', () => {
  test('has badges for common story points', () => {
    assert.strictEqual(POINT_BADGES[1], '🟢');
    assert.strictEqual(POINT_BADGES[2], '🟢');
    assert.strictEqual(POINT_BADGES[3], '🟡');
    assert.strictEqual(POINT_BADGES[5], '🟠');
    assert.strictEqual(POINT_BADGES[8], '🔴');
    assert.strictEqual(POINT_BADGES[13], '🔴');
    assert.strictEqual(POINT_BADGES[21], '⚫');
  });

  test('has default badge', () => {
    assert.strictEqual(POINT_BADGES.default, '⚪');
  });
});

// =============================================================================
// SCHEMA_TYPES Tests
// =============================================================================

describe('SCHEMA_TYPES', () => {
  test('includes project-meta', () => {
    assert(SCHEMA_TYPES.includes('project-meta'));
  });

  test('includes inception-deck', () => {
    assert(SCHEMA_TYPES.includes('inception-deck'));
  });

  test('includes specification', () => {
    assert(SCHEMA_TYPES.includes('specification'));
  });

  test('includes development', () => {
    assert(SCHEMA_TYPES.includes('development'));
  });

  test('has exactly 4 types', () => {
    assert.strictEqual(SCHEMA_TYPES.length, 4);
  });
});

// =============================================================================
// PROJECT_DIRECTORIES Tests
// =============================================================================

describe('PROJECT_DIRECTORIES', () => {
  test('includes input', () => {
    assert(PROJECT_DIRECTORIES.includes('input'));
  });

  test('includes output', () => {
    assert(PROJECT_DIRECTORIES.includes('output'));
  });

  test('has exactly 2 directories', () => {
    assert.strictEqual(PROJECT_DIRECTORIES.length, 2);
  });
});

// =============================================================================
// PROJECT_STATUSES Tests
// =============================================================================

describe('PROJECT_STATUSES', () => {
  test('includes inception', () => {
    assert(PROJECT_STATUSES.includes('inception'));
  });

  test('includes development', () => {
    assert(PROJECT_STATUSES.includes('development'));
  });

  test('includes complete', () => {
    assert(PROJECT_STATUSES.includes('complete'));
  });
});

// =============================================================================
// getRiskLevel Tests
// =============================================================================

describe('getRiskLevel', () => {
  test('returns High for score >= 15', () => {
    assert.strictEqual(getRiskLevel(15), 'High');
    assert.strictEqual(getRiskLevel(20), 'High');
    assert.strictEqual(getRiskLevel(100), 'High');
  });

  test('returns Medium for score >= 8 and < 15', () => {
    assert.strictEqual(getRiskLevel(8), 'Medium');
    assert.strictEqual(getRiskLevel(10), 'Medium');
    assert.strictEqual(getRiskLevel(14), 'Medium');
  });

  test('returns Low for score < 8', () => {
    assert.strictEqual(getRiskLevel(0), 'Low');
    assert.strictEqual(getRiskLevel(5), 'Low');
    assert.strictEqual(getRiskLevel(7), 'Low');
  });
});

// =============================================================================
// getPointsBadge Tests
// =============================================================================

describe('getPointsBadge', () => {
  test('returns correct badge for known points', () => {
    assert.strictEqual(getPointsBadge(1), '🟢');
    assert.strictEqual(getPointsBadge(3), '🟡');
    assert.strictEqual(getPointsBadge(8), '🔴');
  });

  test('returns default badge for unknown points', () => {
    assert.strictEqual(getPointsBadge(4), '⚪');
    assert.strictEqual(getPointsBadge(100), '⚪');
    assert.strictEqual(getPointsBadge(0), '⚪');
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log('\n========================================');
console.log('Trestleboard Config Tests');
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
