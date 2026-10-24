/**
 * Persona front matter parsing
 *
 * Every persona file starts with a YAML block fenced by `---` lines that
 * identifies it as a persona and describes how it fits into the workflow.
 */

const yaml = require('js-yaml');

const FRONT_MATTER_PATTERN = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/**
 * Split a persona file into its front matter and body
 * @param {string} content - Raw file content
 * @returns {{data: object|null, body: string, error?: string}}
 */
function parseFrontMatter(content) {
  const match = FRONT_MATTER_PATTERN.exec(content);
  if (!match) {
    return { data: null, body: content, error: 'Missing front matter block' };
  }

  try {
    const data = yaml.load(match[1]);
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      return { data: null, body: match[2], error: 'Front matter must be a YAML mapping' };
    }
    return { data, body: match[2] };
  } catch (e) {
    return { data: null, body: match[2], error: `Invalid front matter YAML: ${e.message}` };
  }
}

/**
 * Join front matter and body back into a persona file
 * @param {object} data - Front matter data
 * @param {string} body - Markdown body
 * @returns {string} Persona file content
 */
function serializeFrontMatter(data, body) {
  return `---\n${yaml.dump(data, { lineWidth: 100 }).trimEnd()}\n---\n${body}`;
}

module.exports = { parseFrontMatter, serializeFrontMatter };
