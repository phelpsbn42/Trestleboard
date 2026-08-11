#!/usr/bin/env node

/**
 * Trestleboard Formatters Tests
 *
 * Unit tests for the summary formatters (strategy pattern).
 */

const assert = require('assert');

const {
  formatProjectMeta,
  formatInceptionDeck,
  formatSpecification,
  formatDevelopment,
  summaryFormatters,
  getSummaryLines,
  registerFormatter
} = require('./formatters');

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
// formatProjectMeta Tests
// =============================================================================

describe('formatProjectMeta', () => {
  test('includes project name', () => {
    const lines = formatProjectMeta({ project_name: 'test-project' });
    assert(lines.some(l => l.includes('test-project')));
  });

  test('includes status', () => {
    const lines = formatProjectMeta({ status: 'inception' });
    assert(lines.some(l => l.includes('inception')));
  });

  test('includes created date', () => {
    const lines = formatProjectMeta({ created_date: '2024-01-15' });
    assert(lines.some(l => l.includes('2024-01-15')));
  });

  test('includes team count when present', () => {
    const lines = formatProjectMeta({ team: [{}, {}, {}] });
    assert(lines.some(l => l.includes('3 members')));
  });

  test('handles missing data gracefully', () => {
    const lines = formatProjectMeta({});
    assert(lines.some(l => l.includes('N/A')));
  });
});

// =============================================================================
// formatInceptionDeck Tests
// =============================================================================

describe('formatInceptionDeck', () => {
  test('includes project name', () => {
    const lines = formatInceptionDeck({ project_name: 'deck-project' });
    assert(lines.some(l => l.includes('deck-project')));
  });

  test('counts completed sections', () => {
    const data = {
      section_1_why_are_we_here: { content: 'test' },
      section_2_elevator_pitch: { content: 'test' }
    };
    const lines = formatInceptionDeck(data);
    assert(lines.some(l => l.includes('2/10')));
  });

  test('shows 0 sections for empty deck', () => {
    const lines = formatInceptionDeck({});
    assert(lines.some(l => l.includes('0/10')));
  });

  test('includes risk count when present', () => {
    const data = {
      section_7_risks: { risks: [{}, {}, {}] }
    };
    const lines = formatInceptionDeck(data);
    assert(lines.some(l => l.includes('3 identified')));
  });
});

// =============================================================================
// formatSpecification Tests
// =============================================================================

describe('formatSpecification', () => {
  test('includes project name', () => {
    const lines = formatSpecification({ project_name: 'spec-project' });
    assert(lines.some(l => l.includes('spec-project')));
  });

  test('includes use case count', () => {
    const data = { use_cases: { use_cases: [{}, {}] } };
    const lines = formatSpecification(data);
    assert(lines.some(l => l.includes('Use Cases: 2')));
  });

  test('includes ADR count', () => {
    const data = { adrs: [{}, {}, {}] };
    const lines = formatSpecification(data);
    assert(lines.some(l => l.includes('ADRs: 3')));
  });
});

// =============================================================================
// formatDevelopment Tests
// =============================================================================

describe('formatDevelopment', () => {
  test('includes project name', () => {
    const lines = formatDevelopment({ project_name: 'dev-project' });
    assert(lines.some(l => l.includes('dev-project')));
  });

  test('shows task completion', () => {
    const data = {
      task_breakdown: {
        tasks: [
          { status: 'done', points: 5 },
          { status: 'in_progress', points: 3 },
          { status: 'done', points: 2 }
        ]
      }
    };
    const lines = formatDevelopment(data);
    assert(lines.some(l => l.includes('2/3 completed')));
  });

  test('shows total story points', () => {
    const data = {
      task_breakdown: {
        tasks: [
          { points: 5 },
          { points: 3 },
          { points: 8 }
        ]
      }
    };
    const lines = formatDevelopment(data);
    assert(lines.some(l => l.includes('Story Points: 16')));
  });
});

// =============================================================================
// summaryFormatters Registry Tests
// =============================================================================

describe('summaryFormatters registry', () => {
  test('has formatter for project-meta', () => {
    assert.strictEqual(typeof summaryFormatters['project-meta'], 'function');
  });

  test('has formatter for inception-deck', () => {
    assert.strictEqual(typeof summaryFormatters['inception-deck'], 'function');
  });

  test('has formatter for specification', () => {
    assert.strictEqual(typeof summaryFormatters['specification'], 'function');
  });

  test('has formatter for development', () => {
    assert.strictEqual(typeof summaryFormatters['development'], 'function');
  });
});

// =============================================================================
// getSummaryLines Tests
// =============================================================================

describe('getSummaryLines', () => {
  test('returns lines for valid schema type', () => {
    const lines = getSummaryLines({ project_name: 'test' }, 'project-meta');
    assert(Array.isArray(lines));
    assert(lines.length > 0);
  });

  test('returns empty array for unknown schema type', () => {
    const lines = getSummaryLines({}, 'unknown-schema');
    assert(Array.isArray(lines));
    assert.strictEqual(lines.length, 0);
  });
});

// =============================================================================
// registerFormatter Tests
// =============================================================================

describe('registerFormatter', () => {
  test('registers new formatter', () => {
    const customFormatter = (data) => [`Custom: ${data.value}`];
    registerFormatter('custom-schema', customFormatter);

    const lines = getSummaryLines({ value: 'test' }, 'custom-schema');
    assert(lines.some(l => l.includes('Custom: test')));
  });

  test('can override existing formatter', () => {
    const originalLines = getSummaryLines({ project_name: 'test' }, 'project-meta');

    registerFormatter('project-meta', () => ['Overridden']);
    const newLines = getSummaryLines({}, 'project-meta');

    assert.strictEqual(newLines[0], 'Overridden');

    // Restore original (for other tests)
    registerFormatter('project-meta', formatProjectMeta);
  });
});

// =============================================================================
// Summary
// =============================================================================

console.log('\n========================================');
console.log('Trestleboard Formatters Tests');
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
