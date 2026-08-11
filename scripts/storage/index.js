/**
 * Storage module exports
 *
 * Usage:
 *   const { LocalStorage, StorageProvider } = require('./storage');
 *   const storage = new LocalStorage();
 *
 * To implement a custom provider:
 *   class MyStorage extends StorageProvider {
 *     async read(path) { ... }
 *     async write(path, content) { ... }
 *     async exists(path) { ... }
 *     async mkdir(path) { ... }
 *   }
 */
const StorageProvider = require('./StorageProvider');
const LocalStorage = require('./LocalStorage');

// Default storage instance for convenience
const defaultStorage = new LocalStorage();

module.exports = {
  StorageProvider,
  LocalStorage,
  defaultStorage
};
