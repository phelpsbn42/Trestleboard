/**
 * Handlebars Helpers Registry
 *
 * Categorized helpers for template rendering.
 * Add new helpers to the appropriate category file.
 */

const formatHelpers = require('./format');
const comparisonHelpers = require('./comparison');
const arrayHelpers = require('./array');
const utilityHelpers = require('./utility');
const markdownHelpers = require('./markdown');

// Combined registry of all helpers
const allHelpers = {
  ...formatHelpers,
  ...comparisonHelpers,
  ...arrayHelpers,
  ...utilityHelpers,
  ...markdownHelpers
};

/**
 * Register all helpers with a Handlebars instance
 * @param {object} Handlebars - Handlebars instance
 */
function registerAllHelpers(Handlebars) {
  for (const [name, fn] of Object.entries(allHelpers)) {
    // Special case for json helper which needs Handlebars reference
    if (name === 'json') {
      Handlebars.registerHelper(name, function(context) {
        return fn(context, Handlebars);
      });
    } else {
      Handlebars.registerHelper(name, fn);
    }
  }
}

module.exports = {
  formatHelpers,
  comparisonHelpers,
  arrayHelpers,
  utilityHelpers,
  markdownHelpers,
  allHelpers,
  registerAllHelpers
};
