#!/usr/bin/env node

/**
 * Trestleboard JSON Schema Validator
 *
 * Validates JSON data files against Trestleboard schemas.
 *
 * Usage:
 *   tb-validate --data <data.json> --schema <schema-type>
 *   tb-validate -d inception-deck.json -s inception-deck
 */

const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { program } = require('commander');
const { LocalStorage } = require('./storage');
const { SCHEMA_TYPES } = require('./config');
const { getSummaryLines } = require('./formatters');
const { loadCustomizations } = require('./customizations');

// Try to use chalk, fallback to plain text
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  chalk = {
    green: (s) => s,
    red: (s) => s,
    yellow: (s) => s,
    blue: (s) => s,
    gray: (s) => s,
    bold: (s) => s
  };
}

// Configure program (but don't parse yet - that happens at the bottom when run directly)
program
  .name('tb-validate')
  .description('Validate JSON data against Trestleboard schemas')
  .version('1.0.0')
  .requiredOption('-d, --data <path>', 'Path to JSON data file')
  .requiredOption('-s, --schema <type>', 'Schema type: project-meta, inception-deck, specification, development, quality (or a custom data file id)')
  .option('-v, --verbose', 'Show detailed validation errors');

// Use schema types from config (exported for backward compatibility)
const schemaTypes = SCHEMA_TYPES;

// =============================================================================
// Core Functions (testable, no I/O side effects)
// =============================================================================

/**
 * Create a configured AJV validator instance
 * @param {object} options - Validator options
 * @param {boolean} options.verbose - Include verbose error info
 * @returns {Ajv} Configured AJV instance
 */
function createValidator(options = {}) {
  const ajv = new Ajv({ allErrors: true, verbose: options.verbose });
  addFormats(ajv);
  return ajv;
}

/**
 * Validate data against a schema
 * @param {object} data - The data to validate
 * @param {object} schema - The JSON schema
 * @param {object} options - Validation options
 * @returns {object} Result with valid flag and errors array
 */
function validateData(data, schema, options = {}) {
  const ajv = createValidator(options);
  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: valid ? [] : validate.errors
  };
}

/**
 * Format validation errors for display
 * @param {Array} errors - AJV error array
 * @param {boolean} verbose - Include detailed params
 * @returns {Array} Formatted error strings
 */
function formatValidationErrors(errors, verbose = false) {
  return errors.map(error => {
    const location = error.instancePath || '(root)';
    let message = `${location}: ${error.message}`;
    if (verbose && error.params) {
      message += ` (${JSON.stringify(error.params)})`;
    }
    return message;
  });
}

/**
 * Load and parse a schema file
 * @param {string} schemaType - Schema type name
 * @param {string} schemasDir - Path to schemas directory
 * @param {object} storage - Storage provider instance
 * @param {object} customSchemas - Custom data files: map of schema type to schema file path
 * @returns {object} Result with schema or error
 */
function loadSchema(schemaType, schemasDir, storage = new LocalStorage(), customSchemas = {}) {
  const isBuiltIn = schemaTypes.includes(schemaType);
  if (!isBuiltIn && !customSchemas[schemaType]) {
    const valid = [...schemaTypes, ...Object.keys(customSchemas)];
    return { error: `Invalid schema type. Must be one of: ${valid.join(', ')}` };
  }

  const schemaPath = isBuiltIn
    ? path.join(schemasDir, `${schemaType}.schema.json`)
    : customSchemas[schemaType];

  if (!storage.existsSync(schemaPath)) {
    return { error: `Schema file not found: ${schemaPath}` };
  }

  try {
    const schemaContent = storage.readSync(schemaPath);
    return { schema: JSON.parse(schemaContent), schemaPath };
  } catch (e) {
    return { error: `Invalid schema JSON: ${e.message}` };
  }
}

/**
 * Parse JSON data with error handling
 * @param {string} jsonString - The JSON string to parse
 * @returns {object} Result with data or error
 */
function parseData(jsonString) {
  try {
    return { data: JSON.parse(jsonString) };
  } catch (e) {
    return { error: `Invalid JSON: ${e.message}` };
  }
}

// =============================================================================
// CLI Main Function (handles I/O)
// =============================================================================

async function main(options, storage = new LocalStorage()) {
  const cwd = process.cwd();
  const schemasDir = path.join(cwd, 'schemas');

  // Custom data files (only when customizations are enabled)
  const customizations = loadCustomizations(cwd, storage);
  if (customizations.status.message && customizations.status.state !== 'missing') {
    console.error(chalk.yellow(customizations.status.message));
  }
  const customSchemas = Object.fromEntries(customizations.dataFiles.map(d => [d.id, d.schema]));

  // Load schema
  const schemaResult = loadSchema(options.schema, schemasDir, storage, customSchemas);
  if (schemaResult.error) {
    console.error(chalk.red(`Error: ${schemaResult.error}`));
    process.exit(1);
  }

  // Find data file
  let dataPath = options.data;
  if (!await storage.exists(dataPath)) {
    const cwdPath = path.join(cwd, dataPath);
    if (await storage.exists(cwdPath)) {
      dataPath = cwdPath;
    } else {
      console.error(chalk.red(`Error: Data file not found: ${dataPath}`));
      process.exit(1);
    }
  }

  // Load and parse data
  const dataContent = await storage.read(dataPath);
  const dataResult = parseData(dataContent);
  if (dataResult.error) {
    console.error(chalk.red(`Error: ${dataResult.error}`));
    process.exit(1);
  }

  // Validate
  const result = validateData(dataResult.data, schemaResult.schema, { verbose: options.verbose });

  console.log('');
  console.log(chalk.bold(`Validating: ${path.basename(dataPath)}`));
  console.log(chalk.gray(`Schema: ${options.schema}`));
  console.log('');

  if (result.valid) {
    console.log(chalk.green('✓ Validation passed'));
    console.log('');
    showDataSummary(dataResult.data, options.schema);
  } else {
    console.log(chalk.red('✗ Validation failed'));
    console.log('');
    console.log(chalk.bold('Errors:'));
    const formattedErrors = formatValidationErrors(result.errors, options.verbose);
    for (const error of formattedErrors) {
      console.log(chalk.red(`  • ${error}`));
    }
    console.log('');
    process.exit(1);
  }
}

/**
 * Show data summary using schema-specific formatter
 * Uses strategy pattern - add new formatters in formatters/summary.js
 */
function showDataSummary(data, schemaType) {
  console.log(chalk.bold('Summary:'));

  const lines = getSummaryLines(data, schemaType);
  for (const line of lines) {
    console.log(line);
  }

  console.log('');
}

// Export for testing and external use
module.exports = {
  showDataSummary,
  schemaTypes,
  createValidator,
  validateData,
  formatValidationErrors,
  loadSchema,
  parseData,
  main,
  // Re-export storage for convenience
  LocalStorage,
  StorageProvider: require('./storage').StorageProvider
};

// Only run main when executed directly
if (require.main === module) {
  program.parse(process.argv);
  const options = program.opts();
  main(options);
}
