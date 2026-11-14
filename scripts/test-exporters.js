#!/usr/bin/env node

const assert = require('assert');
const { sceneToSvg } = require('./export-excalidraw');
const { findPandoc, exportPdf } = require('./export-pdf');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    console.log(`  ✗ ${name}\n    ${error.message}`);
  }
}

console.log('\nDocument Export Tests');

test('exports basic Excalidraw shapes and text to SVG', () => {
  const svg = sceneToSvg({
    elements: [
      { type: 'rectangle', x: 0, y: 0, width: 100, height: 50 },
      { type: 'arrow', x: 0, y: 0, width: 100, height: 0, points: [[0, 0], [100, 0]] },
      { type: 'text', x: 10, y: 10, width: 50, height: 20, text: 'System', fontSize: 20 }
    ]
  });
  assert(svg.startsWith('<svg'));
  assert(svg.includes('<rect'));
  assert(svg.includes('marker-end'));
  assert(svg.includes('System'));
});

test('rejects unsupported Excalidraw element types', () => {
  assert.throws(() => sceneToSvg({ elements: [{ type: 'image', x: 0, y: 0, width: 1, height: 1 }] }),
    /Unsupported Excalidraw element type/);
});

test('detects an available Pandoc executable', () => {
  assert.strictEqual(findPandoc('pandoc-test', () => ({ status: 0 })), 'pandoc-test');
});

test('explains how to install Pandoc when it is unavailable', () => {
  assert.throws(
    () => exportPdf(__filename, undefined, undefined, 'pandoc-test', () => ({ status: null })),
    /Pandoc is required.*pandoc.org/
  );
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
