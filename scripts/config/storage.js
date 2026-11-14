const STORAGE_BACKENDS = ['filesystem', 'database'];
const DATABASE_PROVIDERS = ['mongodb', 'mysql'];

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validate storage settings from trestleboard.yaml.
 *
 * @param {object} [settings]
 * @returns {string[]} Validation errors
 */
function validateStorageSettings(settings = {}) {
  if (!isObject(settings)) {
    return ['trestleboard.yaml: storage must be a mapping'];
  }

  const errors = [];
  const backend = settings.backend === undefined ? 'filesystem' : settings.backend;
  if (!STORAGE_BACKENDS.includes(backend)) {
    errors.push(`trestleboard.yaml: storage.backend must be one of: ${STORAGE_BACKENDS.join(', ')}`);
  }

  if (settings.filesystem !== undefined && !isObject(settings.filesystem)) {
    errors.push('trestleboard.yaml: storage.filesystem must be a mapping');
  }
  if (settings.filesystem && settings.filesystem.projects_path !== undefined &&
    (typeof settings.filesystem.projects_path !== 'string' || !settings.filesystem.projects_path.trim())) {
    errors.push('trestleboard.yaml: storage.filesystem.projects_path must be a non-empty string');
  }

  if (settings.database !== undefined && !isObject(settings.database)) {
    errors.push('trestleboard.yaml: storage.database must be a mapping');
  }

  if (backend === 'database') {
    const database = settings.database;
    if (!isObject(database)) {
      errors.push('trestleboard.yaml: storage.database is required when storage.backend is database');
    } else {
      const provider = database.provider === undefined ? 'mongodb' : database.provider;
      if (!DATABASE_PROVIDERS.includes(provider)) {
        errors.push(`trestleboard.yaml: storage.database.provider must be one of: ${DATABASE_PROVIDERS.join(', ')}`);
      }
      const hasConnectionString = typeof database.connection_string === 'string' && database.connection_string.trim();
      const hasConnectionEnvironment = typeof database.connection_string_env === 'string' && database.connection_string_env.trim();
      if (!hasConnectionString && !hasConnectionEnvironment) {
        errors.push('trestleboard.yaml: storage.database requires connection_string or connection_string_env when storage.backend is database');
      }
      if (database.connection_string !== undefined &&
        (typeof database.connection_string !== 'string' || !database.connection_string.trim())) {
        errors.push('trestleboard.yaml: storage.database.connection_string must be a non-empty string');
      }
      if (database.connection_string_env !== undefined &&
        (typeof database.connection_string_env !== 'string' || !database.connection_string_env.trim())) {
        errors.push('trestleboard.yaml: storage.database.connection_string_env must be a non-empty string');
      }
      if (typeof database.name !== 'string' || !database.name.trim()) {
        errors.push('trestleboard.yaml: storage.database.name must be a non-empty string when storage.backend is database');
      }
      for (const key of ['resource', 'collection']) {
        if (database[key] !== undefined &&
          (typeof database[key] !== 'string' || !database[key].trim())) {
          errors.push(`trestleboard.yaml: storage.database.${key} must be a non-empty string`);
        }
      }
    }
  }

  return errors;
}

module.exports = {
  STORAGE_BACKENDS,
  DATABASE_PROVIDERS,
  validateStorageSettings
};
