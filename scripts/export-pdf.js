#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { program } = require('commander');

program
  .name('tb-export-pdf')
  .description('Export Markdown documentation to PDF using Pandoc')
  .requiredOption('-i, --input <path>', 'Markdown input path')
  .option('-o, --output <path>', 'PDF output path')
  .option('-e, --pdf-engine <engine>', 'Pandoc PDF engine, such as xelatex, tectonic, or weasyprint')
  .option('--pandoc <path>', 'Pandoc executable path');

function findPandoc(command = process.env.TRESTLEBOARD_PANDOC, spawn = spawnSync) {
  const executable = command || 'pandoc';
  const result = spawn(executable, ['--version'], { stdio: 'ignore' });
  return result.status === 0 ? executable : undefined;
}

function exportPdf(input, output, pdfEngine, pandoc, spawn = spawnSync) {
  if (!fs.existsSync(input)) throw new Error(`Markdown file not found: ${input}`);
  const executable = findPandoc(pandoc, spawn);
  if (!executable) {
    throw new Error('Pandoc is required for PDF export. Install Pandoc from https://pandoc.org/installing.html, then retry.');
  }
  const target = output || path.join(path.dirname(input), `${path.basename(input, path.extname(input))}.pdf`);
  const args = [input, '--output', target, `--resource-path=${path.dirname(input)}`];
  if (pdfEngine) args.push(`--pdf-engine=${pdfEngine}`);
  const result = spawn(executable, args, { encoding: 'utf8' });
  if (result.status !== 0 || !fs.existsSync(target)) {
    throw new Error(`Pandoc could not create the PDF. Ensure Pandoc and a PDF engine are installed${pdfEngine ? ` (${pdfEngine})` : ''}. ${result.stderr || ''}`.trim());
  }
  return target;
}

module.exports = { findPandoc, exportPdf };

if (require.main === module) {
  program.parse(process.argv);
  try {
    const options = program.opts();
    console.log(`Exported: ${exportPdf(options.input, options.output, options.pdfEngine, options.pandoc)}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}
