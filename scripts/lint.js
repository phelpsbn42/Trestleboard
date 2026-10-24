#!/usr/bin/env node

/**
 * Trestleboard Consistency Linter
 *
 * Checks that personas, templates, schemas and customizations are consistent
 * with one another: persona front matter, required sections, referenced
 * templates and schemas, and valid customizations.
 *
 * Usage:
 *   tb-lint [--json]
 */

const path = require('path');
const yaml = require('js-yaml');
const { program } = require('commander');
const { LocalStorage } = require('./storage');
const {
  PERSONA_MODES,
  PERSONA_REQUIRED_FIELDS,
  PERSONA_REQUIRED_SECTIONS,
  SCHEMA_TYPES
} = require('./config');
const { resolvePersonas, splitSections } = require('./personas');
const { loadCustomizations } = require('./customizations');

program
  .name('tb-lint')
  .description('Check Trestleboard personas, templates and customizations for consistency')
  .version('1.0.0')
  .option('--json', 'Output results as JSON');

// =============================================================================
// Core Functions (testable, no I/O side effects beyond the storage provider)
// =============================================================================

/**
 * Check one resolved persona
 * @param {string} id - Persona id
 * @param {object} persona - Resolved persona (file, meta, body, mode)
 * @param {object} context
 * @param {Set<string>} context.schemaTypes - Known schema/data file ids
 * @param {string} context.root - Trestleboard root
 * @param {object} context.storage - Storage provider
 * @returns {string[]} Error messages
 */
function lintPersona(id, persona, { schemaTypes, root, storage }) {
  const errors = [];
  const label = path.relative(root, persona.file) || persona.file;
  const fail = message => errors.push(`${label}: ${message}`);
  const { meta } = persona;
  const isBase = persona.mode === 'base';

  for (const field of PERSONA_REQUIRED_FIELDS) {
    if (meta[field] === undefined || meta[field] === '') fail(`front matter is missing '${field}'`);
  }

  if (isBase && meta.mode !== 'base') {
    fail(`mode '${meta.mode}' must be 'base' for out-of-box personas`);
  }
  if (!isBase && meta.mode !== undefined && !PERSONA_MODES.includes(meta.mode) && meta.mode !== 'base') {
    fail(`mode '${meta.mode}' must be one of: ${PERSONA_MODES.join(', ')}`);
  }

  if (isBase && path.basename(persona.file, '.md') !== id) {
    fail(`persona id '${id}' does not match the file name`);
  }

  const { preamble, sections } = splitSections(persona.body);
  const h1 = /^# (.+)$/m.exec(preamble);
  if (!h1) {
    fail('missing a level-1 title');
  } else if (meta.name && h1[1].trim() !== `${meta.name} Persona`) {
    fail(`title '${h1[1].trim()}' should be '${meta.name} Persona'`);
  }

  const titles = sections.map(s => s.title);
  const duplicate = titles.find((t, i) => titles.indexOf(t) !== i);
  if (duplicate) fail(`duplicate section '${duplicate}'`);

  let lastIndex = -1;
  for (const required of PERSONA_REQUIRED_SECTIONS) {
    const index = titles.indexOf(required);
    if (index === -1) {
      fail(`missing required section '${required}'`);
    } else if (index < lastIndex) {
      fail(`section '${required}' is out of order`);
    } else {
      lastIndex = index;
    }
  }

  for (const template of meta.templates || []) {
    if (!storage.existsSync(path.join(root, template))) {
      fail(`references missing template '${template}'`);
    }
  }
  for (const output of meta.outputs || []) {
    if (!schemaTypes.has(output)) fail(`output '${output}' has no schema or data file`);
  }

  return errors;
}

/**
 * Lint a whole Trestleboard installation
 * @param {string} root - Trestleboard root directory
 * @param {object} storage - Storage provider
 * @returns {{errors: string[], warnings: string[], personas: string[]}}
 */
function lint(root, storage = new LocalStorage()) {
  const errors = [];
  const warnings = [];

  const configPath = path.join(root, 'trestleboard.yaml');
  const config = storage.existsSync(configPath) ? yaml.load(storage.readSync(configPath)) || {} : {};
  const personasConfig = config.personas || {};
  const customizations = loadCustomizations(root, storage);

  if (customizations.status.state === 'ignored') warnings.push(customizations.status.message);
  errors.push(...customizations.errors);

  const { personas, errors: loadErrors } = resolvePersonas({
    baseDir: path.join(root, personasConfig.path || 'personas'),
    customDir: customizations.personasDir,
    storage
  });
  errors.push(...loadErrors);

  const schemaTypes = new Set(SCHEMA_TYPES);
  for (const dataFile of customizations.dataFiles) {
    if (SCHEMA_TYPES.includes(dataFile.id)) {
      errors.push(`customizations.yaml: data file '${dataFile.id}' collides with a built-in schema`);
    }
    schemaTypes.add(dataFile.id);
  }

  for (const [id, persona] of personas) {
    errors.push(...lintPersona(id, persona, { schemaTypes, root, storage }));
  }

  const available = personasConfig.available || [];
  for (const id of available) {
    if (!personas.has(id)) errors.push(`trestleboard.yaml: persona '${id}' is listed but has no persona file`);
  }
  for (const [id, persona] of personas) {
    if (persona.mode === 'base' && !available.includes(id)) {
      errors.push(`trestleboard.yaml: persona '${id}' is not listed under personas.available`);
    }
  }

  for (const type of SCHEMA_TYPES) {
    if (!storage.existsSync(path.join(root, 'schemas', `${type}.schema.json`))) {
      errors.push(`schemas/${type}.schema.json: schema is missing`);
    }
  }

  return { errors, warnings, personas: [...personas.keys()] };
}

// =============================================================================
// CLI
// =============================================================================

function main(options, root = path.join(__dirname, '..')) {
  const result = lint(root);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    result.errors.forEach(e => console.error(`error:   ${e}`));
    result.warnings.forEach(w => console.error(`warning: ${w}`));
    console.log(`Checked ${result.personas.length} personas: ${result.errors.length} errors, ${result.warnings.length} warnings`);
  }
  process.exitCode = result.errors.length > 0 ? 1 : 0;
}

module.exports = { lintPersona, lint, main };

if (require.main === module) {
  program.parse(process.argv);
  main(program.opts());
}
