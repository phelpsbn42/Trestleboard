/**
 * Summary Formatters
 *
 * Strategy pattern implementation for schema-specific data summaries.
 * Add new formatters here without modifying showDataSummary().
 */

/**
 * Format project-meta summary
 * @param {object} data - Project metadata
 * @returns {string[]} Summary lines
 */
function formatProjectMeta(data) {
  const lines = [
    `  Project: ${data.project_name || 'N/A'}`,
    `  Status: ${data.status || 'N/A'}`,
    `  Created: ${data.created_date || 'N/A'}`
  ];
  if (data.team) {
    lines.push(`  Team: ${data.team.length} members`);
  }
  return lines;
}

/**
 * Format inception-deck summary
 * @param {object} data - Inception deck data
 * @returns {string[]} Summary lines
 */
function formatInceptionDeck(data) {
  const sections = [
    'section_1_why_are_we_here',
    'section_2_elevator_pitch',
    'section_3_product_box',
    'section_4_not_list',
    'section_5_meet_neighbors',
    'section_6_show_solution',
    'section_7_risks',
    'section_8_sizing',
    'section_9_tradeoffs',
    'section_10_what_it_takes'
  ];
  const completedSections = sections.filter(s => data[s] && Object.keys(data[s]).length > 0);

  const lines = [
    `  Project: ${data.project_name || 'N/A'}`,
    `  Sections: ${completedSections.length}/10 completed`
  ];

  if (data.section_7_risks && data.section_7_risks.risks) {
    lines.push(`  Risks: ${data.section_7_risks.risks.length} identified`);
  }
  return lines;
}

/**
 * Format specification summary
 * @param {object} data - Specification data
 * @returns {string[]} Summary lines
 */
function formatSpecification(data) {
  const lines = [`  Project: ${data.project_name || 'N/A'}`];

  if (data.use_cases && data.use_cases.use_cases) {
    lines.push(`  Use Cases: ${data.use_cases.use_cases.length}`);
  }
  if (data.adrs) {
    lines.push(`  ADRs: ${data.adrs.length}`);
  }
  return lines;
}

/**
 * Format quality report summary
 * @param {object} data - Quality report data
 * @returns {string[]} Summary lines
 */
function formatQuality(data) {
  const lines = [`  Project: ${data.project_name || 'N/A'}`];

  if (data.findings) {
    const open = data.findings.filter(f => f.status !== 'resolved' && f.status !== 'declined');
    lines.push(`  Findings: ${open.length} open of ${data.findings.length}`);
  }
  if (data.consistency_checks) {
    const failed = data.consistency_checks.filter(c => c.result === 'fail').length;
    lines.push(`  Consistency: ${failed} failing of ${data.consistency_checks.length} checks`);
  }
  return lines;
}

/**
 * Format development summary
 * @param {object} data - Development data
 * @returns {string[]} Summary lines
 */
function formatDevelopment(data) {
  const lines = [`  Project: ${data.project_name || 'N/A'}`];

  if (data.task_breakdown && data.task_breakdown.tasks) {
    const tasks = data.task_breakdown.tasks;
    const completed = tasks.filter(t => t.status === 'done').length;
    const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0);
    lines.push(`  Tasks: ${completed}/${tasks.length} completed`);
    lines.push(`  Story Points: ${totalPoints}`);
  }
  return lines;
}

/**
 * Registry of summary formatters by schema type
 * Add new schema types here - no need to modify showDataSummary()
 */
const summaryFormatters = {
  'project-meta': formatProjectMeta,
  'inception-deck': formatInceptionDeck,
  'specification': formatSpecification,
  'development': formatDevelopment,
  'quality': formatQuality
};

/**
 * Get summary lines for data based on schema type
 * @param {object} data - The data to summarize
 * @param {string} schemaType - Schema type
 * @returns {string[]} Summary lines (empty array if no formatter)
 */
function getSummaryLines(data, schemaType) {
  const formatter = summaryFormatters[schemaType];
  return formatter ? formatter(data) : [];
}

/**
 * Register a new summary formatter
 * @param {string} schemaType - Schema type name
 * @param {function} formatter - Formatter function (data) => string[]
 */
function registerFormatter(schemaType, formatter) {
  summaryFormatters[schemaType] = formatter;
}

module.exports = {
  formatProjectMeta,
  formatInceptionDeck,
  formatSpecification,
  formatDevelopment,
  formatQuality,
  summaryFormatters,
  getSummaryLines,
  registerFormatter
};
