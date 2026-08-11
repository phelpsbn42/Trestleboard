/**
 * Trestleboard Configuration Constants
 *
 * Centralized configuration for easy extension without modifying core code.
 * Add new values here instead of hardcoding in business logic.
 */

// Risk level thresholds for project risk assessment
const RISK_THRESHOLDS = {
  high: 15,
  medium: 8
};

// Story point badges for visual indicators
const POINT_BADGES = {
  1: '🟢',
  2: '🟢',
  3: '🟡',
  5: '🟠',
  8: '🔴',
  13: '🔴',
  21: '⚫',
  default: '⚪'
};

// Valid schema types for validation
const SCHEMA_TYPES = [
  'project-meta',
  'inception-deck',
  'specification',
  'development'
];

// Project directory structure
const PROJECT_DIRECTORIES = [
  'input',
  'output'
];

// Project status values
const PROJECT_STATUSES = [
  'inception',
  'specification',
  'development',
  'complete',
  'on-hold'
];

/**
 * Get risk level label from score
 * @param {number} score - Risk score
 * @returns {string} Risk level label
 */
function getRiskLevel(score) {
  if (score >= RISK_THRESHOLDS.high) return 'High';
  if (score >= RISK_THRESHOLDS.medium) return 'Medium';
  return 'Low';
}

/**
 * Get badge for story points
 * @param {number} points - Story points
 * @returns {string} Badge emoji
 */
function getPointsBadge(points) {
  return POINT_BADGES[points] || POINT_BADGES.default;
}

module.exports = {
  RISK_THRESHOLDS,
  POINT_BADGES,
  SCHEMA_TYPES,
  PROJECT_DIRECTORIES,
  PROJECT_STATUSES,
  getRiskLevel,
  getPointsBadge
};
