/**
 * LocalStorage - StorageProvider implementation for local filesystem
 *
 * This is the default storage provider, wrapping Node.js fs module.
 */
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const StorageProvider = require('./StorageProvider');

class LocalStorage extends StorageProvider {
  /**
   * Check if a file or directory exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if exists
   */
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Synchronous exists check (for backward compatibility)
   * @param {string} filePath - Path to check
   * @returns {boolean} True if exists
   */
  existsSync(filePath) {
    return fsSync.existsSync(filePath);
  }

  /**
   * Read file contents as string
   * @param {string} filePath - Path to read
   * @returns {Promise<string>} File contents
   */
  async read(filePath) {
    return fs.readFile(filePath, 'utf-8');
  }

  /**
   * Synchronous read (for backward compatibility)
   * @param {string} filePath - Path to read
   * @returns {string} File contents
   */
  readSync(filePath) {
    return fsSync.readFileSync(filePath, 'utf-8');
  }

  /**
   * Write content to a file
   * @param {string} filePath - Path to write
   * @param {string} content - Content to write
   * @returns {Promise<void>}
   */
  async write(filePath, content) {
    return fs.writeFile(filePath, content);
  }

  /**
   * Synchronous write (for backward compatibility)
   * @param {string} filePath - Path to write
   * @param {string} content - Content to write
   */
  writeSync(filePath, content) {
    return fsSync.writeFileSync(filePath, content);
  }

  /**
   * Create a directory (and parent directories if needed)
   * @param {string} dirPath - Directory path to create
   * @returns {Promise<void>}
   */
  async mkdir(dirPath) {
    return fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Synchronous mkdir (for backward compatibility)
   * @param {string} dirPath - Directory path to create
   */
  mkdirSync(dirPath) {
    return fsSync.mkdirSync(dirPath, { recursive: true });
  }

  /**
   * List files in a directory
   * @param {string} dirPath - Directory to list
   * @param {object} options - List options
   * @returns {Promise<string[]>} Array of file paths
   */
  async list(dirPath, options = {}) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry => path.join(dirPath, entry.name));
  }

  /**
   * Get the provider name
   * @returns {string} Provider name
   */
  get name() {
    return 'LocalStorage';
  }
}

module.exports = LocalStorage;
