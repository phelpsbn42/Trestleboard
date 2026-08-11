/**
 * Formatting Helpers
 *
 * Helpers for string and date formatting.
 */

const formatHelpers = {
  /**
   * Format date to ISO date string (YYYY-MM-DD)
   */
  formatDate: function(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },

  /**
   * Convert string to uppercase
   */
  uppercase: function(str) {
    return str ? str.toUpperCase() : '';
  },

  /**
   * Convert string to lowercase
   */
  lowercase: function(str) {
    return str ? str.toLowerCase() : '';
  },

  /**
   * Capitalize first letter
   */
  capitalize: function(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * JSON stringify for debugging
   */
  json: function(context, Handlebars) {
    return new Handlebars.SafeString(JSON.stringify(context, null, 2));
  }
};

module.exports = formatHelpers;
