/**
 * Utility Helpers
 *
 * General-purpose template helpers.
 */
const { getRiskLevel, getPointsBadge } = require('../config');

const utilityHelpers = {
  /**
   * Increment a number
   */
  inc: function(value) {
    return parseInt(value) + 1;
  },

  /**
   * Default value if undefined/null
   */
  default: function(value, defaultValue) {
    return value !== undefined && value !== null ? value : defaultValue;
  },

  /**
   * Markdown checkbox
   */
  checkbox: function(checked) {
    return checked ? '[x]' : '[ ]';
  },

  /**
   * Risk score level (uses config)
   */
  riskLevel: function(score) {
    return getRiskLevel(score);
  },

  /**
   * Story points badge (uses config)
   */
  pointsBadge: function(points) {
    return getPointsBadge(points);
  },

  /**
   * Tradeoff slider visualization
   */
  slider: function(value) {
    return `${value}`;
  },

  /**
   * Pluralize a word
   */
  pluralize: function(count, singular, plural) {
    // If plural is the Handlebars options object, use default pluralization
    const pluralForm = (typeof plural === 'string') ? plural : singular + 's';
    return count === 1 ? singular : pluralForm;
  }
};

module.exports = utilityHelpers;
