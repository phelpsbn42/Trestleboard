/**
 * Array Helpers
 *
 * Helpers for array operations in templates.
 */

const arrayHelpers = {
  /**
   * Join array with delimiter
   */
  join: function(array, delimiter) {
    if (!Array.isArray(array)) return '';
    // If delimiter is the Handlebars options object, use default
    const sep = (typeof delimiter === 'string') ? delimiter : ', ';
    return array.join(sep);
  },

  /**
   * Get array length
   */
  length: function(array) {
    return Array.isArray(array) ? array.length : 0;
  },

  /**
   * Sum array of numbers or property of objects
   */
  sum: function(array, property) {
    if (!Array.isArray(array)) return 0;
    // If property is a string (not Handlebars options object), sum that property
    if (typeof property === 'string') {
      return array.reduce((sum, item) => sum + (item[property] || 0), 0);
    }
    // Otherwise sum the array values directly
    return array.reduce((sum, item) => sum + (item || 0), 0);
  },

  /**
   * Repeat block n times
   */
  times: function(n, block) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += block.fn({ index: i, num: i + 1 });
    }
    return result;
  },

  /**
   * Lookup helper for dynamic property access
   */
  lookup: function(obj, key) {
    return obj && obj[key];
  }
};

module.exports = arrayHelpers;
