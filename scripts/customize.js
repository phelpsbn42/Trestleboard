#!/usr/bin/env node

/**
 * Trestleboard Customizations CLI
 *
 * Usage:
 *   tb-customize status              Report whether customizations are active, ignored or missing
 *   tb-customize init [--yes]        Create the customizations folder from the shipped examples
 *   tb-customize list                List the effective personas
 *   tb-customize resolve <persona>   Print the effective persona (after add/override/overload)
 */

const path = require('path');
const readline = require('readline');
const { program } = require('commander');
const { LocalStorage } = require('./storage');
const { getStatus, initCustomizations, loadCustomizations } = require('./customizations');
const { resolvePersonas, serializeFrontMatter } = require('./personas');

const ROOT = path.join(__dirname, '..');

program
  .name('tb-customize')
  .description('Manage Trestleboard customizations')
  .version('1.0.0');

// =============================================================================
// Core Functions
// =============================================================================

/**
 * Resolve the effective persona set for a Trestleboard root
 * @returns {{personas: Map, errors: string[], customizations: object}}
 */
function loadEffectivePersonas(root, storage = new LocalStorage()) {
  const customizations = loadCustomizations(root, storage);
  const { personas, errors } = resolvePersonas({
    baseDir: path.join(root, 'personas'),
    customDir: customizations.personasDir,
    storage
  });
  return { personas, errors: [...customizations.errors, ...errors], customizations };
}

/**
 * Ask a yes/no question on the terminal
 */
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`${question} [y/N] `, answer => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

// =============================================================================
// Commands
// =============================================================================

async function statusCommand(options, root = ROOT) {
  const status = getStatus(root);
  if (status.message) console.log(status.message);

  if (status.state === 'missing') {
    const create = options.yes || (process.stdin.isTTY && await confirm('Create it from the shipped examples now?'));
    if (create) {
      const created = initCustomizations(root);
      console.log(`Created ${created.length} files in ${status.settings.path}`);
    } else {
      console.log('Run `npm run customize -- init` to create it from the shipped examples.');
    }
  }
}

function initCommand(root = ROOT) {
  const created = initCustomizations(root);
  console.log(created.length
    ? `Created ${created.length} files:\n${created.map(f => `  ${path.relative(root, f)}`).join('\n')}`
    : 'Nothing to create: all example files already exist.');
  console.log('Set customizations.enabled: true in trestleboard.yaml to use them.');
}

function listCommand(root = ROOT) {
  const { personas, errors } = loadEffectivePersonas(root);
  for (const [id, persona] of personas) {
    console.log(`${id.padEnd(22)} ${persona.mode.padEnd(9)} ${path.relative(root, persona.file)}`);
  }
  errors.forEach(e => console.error(`error: ${e}`));
  process.exitCode = errors.length ? 1 : 0;
}

function resolveCommand(id, root = ROOT) {
  const { personas, errors } = loadEffectivePersonas(root);
  errors.forEach(e => console.error(`error: ${e}`));
  const persona = personas.get(id);
  if (!persona) {
    console.error(`error: unknown persona '${id}'. Available: ${[...personas.keys()].join(', ')}`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(serializeFrontMatter({ persona: persona.meta }, persona.body));
}

program.command('status').description('Report customization status')
  .option('--yes', 'Create missing customizations without asking')
  .action(options => statusCommand(options));
program.command('init').description('Create customizations from the shipped examples')
  .action(() => initCommand());
program.command('list').description('List the effective personas')
  .action(() => listCommand());
program.command('resolve <persona>').description('Print the effective persona')
  .action(id => resolveCommand(id));

module.exports = { loadEffectivePersonas, statusCommand, initCommand, listCommand, resolveCommand };

if (require.main === module) {
  program.parse(process.argv);
}
