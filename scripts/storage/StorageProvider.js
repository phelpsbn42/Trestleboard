/**
 * StorageProvider - Abstract base class for storage operations
 *
 * Implement this interface to add support for different storage backends:
 * - LocalStorage (default) - local filesystem
 * - GCSStorage - Google Cloud Storage
 * - SharePointStorage - Microsoft SharePoint
 * - GitStorage - Git repositories
 *
 * All methods are async to support remote storage backends.
 */
class StorageProvider {
  /**
   * Check if a file or directory exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if exists
   */
  async exists(filePath) {
    throw new Error('StorageProvider.exists() must be implemented');
  }

  /**
   * Read file contents as string
   * @param {string} filePath - Path to read
   * @returns {Promise<string>} File contents
   * @throws {Error} If file doesn't exist or can't be read
   */
  async read(filePath) {
    throw new Error('StorageProvider.read() must be implemented');
  }

  /**
   * Write content to a file
   * @param {string} filePath - Path to write
   * @param {string} content - Content to write
   * @returns {Promise<void>}
   */
  async write(filePath, content) {
    throw new Error('StorageProvider.write() must be implemented');
  }

  /**
   * Create a directory (and parent directories if needed)
   * @param {string} dirPath - Directory path to create
   * @returns {Promise<void>}
   */
  async mkdir(dirPath) {
    throw new Error('StorageProvider.mkdir() must be implemented');
  }

  /**
   * List files in a directory
   * @param {string} dirPath - Directory to list
   * @param {object} options - List options
   * @param {string} options.pattern - Glob pattern to filter files
   * @returns {Promise<string[]>} Array of file paths
   */
  async list(dirPath, options = {}) {
    throw new Error('StorageProvider.list() must be implemented');
  }

  /**
   * Get the provider name for logging/debugging
   * @returns {string} Provider name
   */
  get name() {
    return 'StorageProvider';
  }
}

module.exports = StorageProvider;
