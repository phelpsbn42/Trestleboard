const path = require('path');
const yaml = require('js-yaml');
const LocalStorage = require('./LocalStorage');
const MongoStorage = require('./MongoStorage');
const MySqlStorage = require('./MySqlStorage');
const { validateStorageSettings } = require('../config/storage');

const providers = new Map();

function registerStorageProvider(name, factory) {
  providers.set(name, factory);
}

registerStorageProvider('mongodb', ({ connectionString, database, resource }) =>
  new MongoStorage({ connectionString, database, collection: resource }));
registerStorageProvider('mysql', ({ connectionString, database, resource }) =>
  new MySqlStorage({ connectionString, database, table: resource }));

function loadStorageSettings(root, localStorage = new LocalStorage()) {
  const configPath = path.join(root, 'trestleboard.yaml');
  if (!localStorage.existsSync(configPath)) return {};

  const config = yaml.load(localStorage.readSync(configPath)) || {};
  return config.storage || {};
}

function createStorage(root, localStorage = new LocalStorage()) {
  const settings = loadStorageSettings(root, localStorage);
  const errors = validateStorageSettings(settings);
  if (errors.length) throw new Error(errors.join('\n'));

  if (settings.backend === 'database') {
    const connectionString = settings.database.connection_string ||
      process.env[settings.database.connection_string_env];
    if (!connectionString) {
      throw new Error(
        `MongoDB connection string is unavailable. Set ${settings.database.connection_string_env} or configure storage.database.connection_string.`
      );
    }
    const providerName = settings.database.provider || 'mongodb';
    const provider = providers.get(providerName);
    if (!provider) throw new Error(`Unsupported database provider: ${providerName}`);

    return provider({
      connectionString,
      database: settings.database.name,
      resource: settings.database.resource || settings.database.collection || 'files'
    });
  }

  return new LocalStorage();
}

function getProjectRoot(root, settings = {}) {
  const projectsPath = settings.filesystem && settings.filesystem.projects_path || 'projects';
  return settings.backend === 'database' ? projectsPath : path.join(root, projectsPath);
}

function availableStorageProviders() {
  return [...providers.keys()];
}

module.exports = {
  loadStorageSettings,
  createStorage,
  getProjectRoot,
  registerStorageProvider,
  availableStorageProviders
};
