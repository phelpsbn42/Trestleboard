/**
 * Persona resolution
 *
 * Loads the out-of-box personas and, when customizations are enabled,
 * layers custom personas on top of them:
 *
 *   add       - a new persona (id must not exist)
 *   override  - replaces the base persona with the same id
 *   overload  - extends the base persona; its `##` sections are merged in
 *               (replace by default, or append/prepend per section)
 */

const path = require('path');
const { LocalStorage } = require('../storage');
const { PERSONA_MODES, SECTION_STRATEGIES } = require('../config');
const { parseFrontMatter } = require('./frontmatter');

const FENCE_PATTERN = /^\s*(```|~~~)/;
const H2_PATTERN = /^## (.+?)\s*$/;

/**
 * Split a markdown body into a preamble and its level-2 sections.
 * Headings inside fenced code blocks are ignored.
 * @param {string} body - Markdown body
 * @returns {{preamble: string, sections: {title: string, content: string}[]}}
 */
function splitSections(body) {
  const lines = body.split(/\r?\n/);
  const preamble = [];
  const sections = [];
  let current = null;
  let inFence = false;

  for (const line of lines) {
    if (FENCE_PATTERN.test(line)) inFence = !inFence;
    const heading = !inFence && H2_PATTERN.exec(line);
    if (heading) {
      current = { title: heading[1], lines: [] };
      sections.push(current);
    } else {
      (current ? current.lines : preamble).push(line);
    }
  }

  return {
    preamble: preamble.join('\n'),
    sections: sections.map(s => ({ title: s.title, content: s.lines.join('\n') }))
  };
}

/**
 * Join a preamble and sections back into markdown
 */
function joinSections({ preamble, sections }) {
  const parts = [preamble.trimEnd()];
  for (const s of sections) {
    parts.push(`## ${s.title}\n${s.content.replace(/^\n+/, '\n').trimEnd()}`);
  }
  return parts.join('\n\n') + '\n';
}

/**
 * Merge an overload persona's sections into a base persona body
 * @param {string} baseBody - Base persona markdown
 * @param {string} overloadBody - Overload persona markdown
 * @param {object} strategies - Map of section title to replace|append|prepend
 * @returns {string} Merged markdown
 */
function applyOverload(baseBody, overloadBody, strategies = {}) {
  const base = splitSections(baseBody);
  const over = splitSections(overloadBody);

  for (const section of over.sections) {
    const strategy = strategies[section.title] || 'replace';
    const existing = base.sections.find(s => s.title === section.title);

    if (!existing) {
      base.sections.push({ ...section });
    } else if (strategy === 'append') {
      existing.content = `${existing.content.trimEnd()}\n${section.content}`;
    } else if (strategy === 'prepend') {
      existing.content = `${section.content.trimEnd()}\n${existing.content}`;
    } else {
      existing.content = section.content;
    }
  }

  return joinSections(base);
}

/**
 * Whether a file is a live persona. README.md and files starting with `_`
 * (the shipped examples) are skipped.
 */
function isPersonaFile(file) {
  const name = path.basename(file);
  return name.endsWith('.md') && !name.startsWith('_') && name.toLowerCase() !== 'readme.md';
}

/**
 * Load every persona (*.md) in a directory
 * @param {string} dir - Directory to scan
 * @param {object} storage - Storage provider
 * @returns {object[]} Entries with file, meta, body and optional error
 */
function loadPersonaDir(dir, storage = new LocalStorage()) {
  if (!storage.existsSync(dir)) return [];

  return storage.listSync(dir)
    .filter(file => isPersonaFile(file))
    .sort()
    .map(file => {
      const { data, body, error } = parseFrontMatter(storage.readSync(file));
      const meta = data && data.persona;
      if (!error && (!meta || typeof meta !== 'object' || !meta.id)) {
        return { file, body, error: 'Front matter is missing a `persona` block with an `id`' };
      }
      return { file, meta, body, error };
    });
}

/**
 * Resolve the effective persona set
 * @param {object} options
 * @param {string} options.baseDir - Out-of-box personas directory
 * @param {string} [options.customDir] - Custom personas directory (only when enabled)
 * @param {object} [options.storage] - Storage provider
 * @returns {{personas: Map<string, object>, errors: string[]}}
 */
function resolvePersonas({ baseDir, customDir, storage = new LocalStorage() }) {
  const personas = new Map();
  const errors = [];

  for (const entry of loadPersonaDir(baseDir, storage)) {
    if (entry.error) {
      errors.push(`${entry.file}: ${entry.error}`);
      continue;
    }
    personas.set(entry.meta.id, { ...entry, mode: 'base' });
  }

  if (!customDir) return { personas, errors };

  for (const entry of loadPersonaDir(customDir, storage)) {
    if (entry.error) {
      errors.push(`${entry.file}: ${entry.error}`);
      continue;
    }

    const { id } = entry.meta;
    const mode = entry.meta.mode || 'add';
    const base = personas.get(id);

    if (!PERSONA_MODES.includes(mode)) {
      errors.push(`${entry.file}: invalid mode '${mode}'. Must be one of: ${PERSONA_MODES.join(', ')}`);
    } else if (mode === 'add' && base) {
      errors.push(`${entry.file}: persona '${id}' already exists; use mode 'override' or 'overload'`);
    } else if (mode !== 'add' && !base) {
      errors.push(`${entry.file}: cannot ${mode} unknown persona '${id}'`);
    } else if (mode === 'overload') {
      const strategies = entry.meta.sections || {};
      const bad = Object.entries(strategies).find(([, s]) => !SECTION_STRATEGIES.includes(s));
      if (bad) {
        errors.push(`${entry.file}: invalid strategy '${bad[1]}' for section '${bad[0]}'. Must be one of: ${SECTION_STRATEGIES.join(', ')}`);
        continue;
      }
      const { mode: _m, sections: _s, ...rest } = entry.meta;
      personas.set(id, {
        file: entry.file,
        baseFile: base.file,
        meta: { ...base.meta, ...rest },
        body: applyOverload(base.body, entry.body, strategies),
        mode
      });
    } else {
      personas.set(id, { ...entry, mode });
    }
  }

  return { personas, errors };
}

module.exports = { splitSections, joinSections, applyOverload, loadPersonaDir, resolvePersonas };
