/**
 * Markdown Helpers
 *
 * Helpers for generating markdown structures.
 */

const markdownHelpers = {
  /**
   * Mermaid diagram wrapper
   */
  mermaid: function(options) {
    return '```mermaid\n' + options.fn(this) + '\n```';
  },

  /**
   * Code block wrapper
   */
  codeblock: function(language, options) {
    return '```' + language + '\n' + options.fn(this) + '\n```';
  }
};

module.exports = markdownHelpers;
