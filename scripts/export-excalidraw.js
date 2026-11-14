#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { program } = require('commander');

program
  .name('tb-export-excalidraw')
  .description('Export an Excalidraw scene to SVG')
  .requiredOption('-i, --input <path>', 'Excalidraw JSON scene')
  .requiredOption('-o, --output <path>', 'SVG output path');

const escapeXml = value => String(value || '').replace(/[<>&'"]/g, char => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
}[char]));

function bounds(elements) {
  const visible = elements.filter(element => !element.isDeleted);
  if (!visible.length) throw new Error('Scene has no visible elements');
  const left = Math.min(...visible.map(element => element.x));
  const top = Math.min(...visible.map(element => element.y));
  const right = Math.max(...visible.map(element => element.x + element.width));
  const bottom = Math.max(...visible.map(element => element.y + element.height));
  return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
}

function style(element) {
  return `stroke="${escapeXml(element.strokeColor || '#1e1e1e')}" fill="${escapeXml(element.backgroundColor || 'none')}" stroke-width="${element.strokeWidth || 1}"`;
}

function points(element) {
  return (element.points || []).map(([x, y]) => `${element.x + x},${element.y + y}`).join(' ');
}

function renderElement(element) {
  if (element.isDeleted) return '';
  const { x, y, width, height, type } = element;
  if (type === 'rectangle') return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${style(element)} />`;
  if (type === 'ellipse') return `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${Math.abs(width / 2)}" ry="${Math.abs(height / 2)}" ${style(element)} />`;
  if (type === 'diamond') return `<polygon points="${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}" ${style(element)} />`;
  if (type === 'line' || type === 'arrow') {
    const marker = type === 'arrow' ? ' marker-end="url(#arrowhead)"' : '';
    return `<polyline points="${points(element)}" fill="none" ${style(element)}${marker} />`;
  }
  if (type === 'text') {
    const lines = String(element.text || '').split('\n');
    const anchor = element.textAlign === 'center' ? 'middle' : element.textAlign === 'right' ? 'end' : 'start';
    const textX = anchor === 'middle' ? x + width / 2 : anchor === 'end' ? x + width : x;
    return `<text x="${textX}" y="${y + (element.fontSize || 20)}" text-anchor="${anchor}" fill="${escapeXml(element.strokeColor || '#1e1e1e')}" font-size="${element.fontSize || 20}" font-family="Arial, sans-serif">${lines.map((line, index) => `<tspan x="${textX}" dy="${index ? (element.fontSize || 20) * 1.25 : 0}">${escapeXml(line)}</tspan>`).join('')}</text>`;
  }
  throw new Error(`Unsupported Excalidraw element type: ${type}`);
}

function sceneToSvg(scene) {
  if (!scene || !Array.isArray(scene.elements)) throw new Error('Invalid Excalidraw scene: expected an elements array');
  const box = bounds(scene.elements);
  const padding = 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width + padding * 2}" height="${box.height + padding * 2}" viewBox="${box.left - padding} ${box.top - padding} ${box.width + padding * 2} ${box.height + padding * 2}"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#1e1e1e" /></marker></defs>${scene.elements.map(renderElement).join('')}</svg>\n`;
}

function exportScene(input, output) {
  const scene = JSON.parse(fs.readFileSync(input, 'utf8'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, sceneToSvg(scene));
}

module.exports = { sceneToSvg, exportScene };

if (require.main === module) {
  program.parse(process.argv);
  try {
    exportScene(program.opts().input, program.opts().output);
    console.log(`Exported: ${program.opts().output}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
