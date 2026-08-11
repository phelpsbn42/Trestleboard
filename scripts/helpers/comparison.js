/**
 * Comparison Helpers
 *
 * Helpers for value comparison in templates.
 */

const comparisonHelpers = {
  /**
   * Equality check (strict)
   */
  eq: function(a, b) {
    return a === b;
  },

  /**
   * Greater than
   */
  gt: function(a, b) {
    return a > b;
  },

  /**
   * Less than
   */
  lt: function(a, b) {
    return a < b;
  }
};

module.exports = comparisonHelpers;
