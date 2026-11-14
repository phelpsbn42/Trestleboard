const DIAGRAM_TYPES = ['c4', 'sequence', 'wireframe'];
const DIAGRAM_MODES = ['primary', 'supplemental', 'disabled'];
const EXCALIDRAW_EXPORTS = ['json', 'svg', 'png'];

const DEFAULT_DIAGRAM_SETTINGS = {
  formats: {
    mermaid: {
      c4: 'primary',
      sequence: 'primary',
      wireframe: 'primary'
    },
    excalidraw: {
      c4: 'supplemental',
      sequence: 'disabled',
      wireframe: 'supplemental',
      exports: ['json']
    }
  }
};

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Resolve diagram settings with defaults for known formats while preserving
 * unknown formats and diagram types for future extensions.
 *
 * @param {object} [settings]
 * @returns {object}
 */
function resolveDiagramSettings(settings = {}) {
  const configured = isObject(settings) ? settings : {};
  const configuredFormats = isObject(configured.formats) ? configured.formats : {};
  const formats = {};
  const names = new Set([
    ...Object.keys(DEFAULT_DIAGRAM_SETTINGS.formats),
    ...Object.keys(configuredFormats)
  ]);

  for (const name of names) {
    const defaults = DEFAULT_DIAGRAM_SETTINGS.formats[name] || {};
    const override = isObject(configuredFormats[name]) ? configuredFormats[name] : {};
    formats[name] = { ...defaults, ...override };
  }

  return { ...configured, formats };
}

/**
 * Validate diagram settings. Exactly one primary format is required for each
 * configured standard diagram type, while supplemental formats are optional.
 *
 * @param {object} [settings]
 * @returns {string[]}
 */
function validateDiagramSettings(settings = {}) {
  const errors = [];
  if (!isObject(settings)) {
    return ['trestleboard.yaml: diagrams must be a mapping'];
  }
  if (settings.formats !== undefined && !isObject(settings.formats)) {
    return ['trestleboard.yaml: diagrams.formats must be a mapping'];
  }

  const resolved = resolveDiagramSettings(settings);
  const primaryFormats = new Map(DIAGRAM_TYPES.map(type => [type, []]));

  for (const [format, formatSettings] of Object.entries(resolved.formats)) {
    if (!isObject(formatSettings)) {
      errors.push(`trestleboard.yaml: diagrams.formats.${format} must be a mapping`);
      continue;
    }

    for (const type of DIAGRAM_TYPES) {
      const mode = formatSettings[type];
      if (mode === undefined) continue;
      if (!DIAGRAM_MODES.includes(mode)) {
        errors.push(`trestleboard.yaml: diagrams.formats.${format}.${type} must be one of: ${DIAGRAM_MODES.join(', ')}`);
      } else if (mode === 'primary') {
        primaryFormats.get(type).push(format);
      }
    }

    if (format === 'excalidraw' && formatSettings.exports !== undefined) {
      if (!Array.isArray(formatSettings.exports) ||
        formatSettings.exports.some(type => !EXCALIDRAW_EXPORTS.includes(type))) {
        errors.push(`trestleboard.yaml: diagrams.formats.excalidraw.exports must contain only: ${EXCALIDRAW_EXPORTS.join(', ')}`);
      }
    }
  }

  for (const [type, formats] of primaryFormats) {
    if (formats.length !== 1) {
      errors.push(`trestleboard.yaml: diagrams must have exactly one primary format for ${type}; found: ${formats.join(', ') || 'none'}`);
    }
  }

  return errors;
}

module.exports = {
  DIAGRAM_TYPES,
  DIAGRAM_MODES,
  EXCALIDRAW_EXPORTS,
  DEFAULT_DIAGRAM_SETTINGS,
  resolveDiagramSettings,
  validateDiagramSettings
};
