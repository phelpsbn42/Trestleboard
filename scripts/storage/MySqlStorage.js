const StorageProvider = require('./StorageProvider');
const { normalizePath, parentPaths } = require('./path-utils');

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, '``')}\``;
}

/**
 * MySQL-backed implementation of the path-based storage interface.
 */
class MySqlStorage extends StorageProvider {
  constructor({ connectionString, database, table = 'files', clientFactory } = {}) {
    super();
    if (!connectionString) throw new Error('MySqlStorage requires a connection string');
    if (!database) throw new Error('MySqlStorage requires a database name');

    this.connectionString = connectionString;
    this.databaseName = database;
    this.tableName = table;
    this.clientFactory = clientFactory || (uri => require('mysql2/promise').createConnection(uri));
    this.connection = null;
    this.ready = null;
  }

  get table() {
    return `${quoteIdentifier(this.databaseName)}.${quoteIdentifier(this.tableName)}`;
  }

  async getConnection() {
    if (!this.connection) this.connection = await this.clientFactory(this.connectionString);
    if (!this.ready) {
      this.ready = this.connection.execute(`
        CREATE TABLE IF NOT EXISTS ${this.table} (
          path VARCHAR(768) PRIMARY KEY,
          kind VARCHAR(16) NOT NULL,
          content LONGTEXT NULL,
          created_at DATETIME(3) NOT NULL,
          updated_at DATETIME(3) NULL
        )
      `);
    }
    await this.ready;
    return this.connection;
  }

  async getEntry(filePath) {
    const connection = await this.getConnection();
    const [rows] = await connection.execute(
      `SELECT path, kind, content FROM ${this.table} WHERE path = ? LIMIT 1`,
      [filePath]
    );
    return rows[0] || null;
  }

  async exists(filePath) {
    return Boolean(await this.getEntry(normalizePath(filePath)));
  }

  async read(filePath) {
    const document = await this.getEntry(normalizePath(filePath));
    if (!document || document.kind !== 'file') throw new Error(`File not found: ${filePath}`);
    return document.content;
  }

  async write(filePath, content) {
    const normalizedPath = normalizePath(filePath);
    const parents = parentPaths(normalizedPath);
    if (parents.length) await this.mkdir(parents[parents.length - 1]);

    const existing = await this.getEntry(normalizedPath);
    if (existing && existing.kind === 'directory') {
      throw new Error(`Cannot write file because a directory exists at: ${filePath}`);
    }

    const connection = await this.getConnection();
    await connection.execute(
      `INSERT INTO ${this.table} (path, kind, content, created_at, updated_at)
       VALUES (?, 'file', ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
       ON DUPLICATE KEY UPDATE kind = 'file', content = VALUES(content), updated_at = VALUES(updated_at)`,
      [normalizedPath, String(content)]
    );
  }

  async mkdir(dirPath) {
    const normalizedPath = normalizePath(dirPath);
    const directories = [...parentPaths(normalizedPath), normalizedPath];
    const connection = await this.getConnection();

    for (const directory of directories) {
      const existing = await this.getEntry(directory);
      if (existing && existing.kind === 'file') {
        throw new Error(`Cannot create directory because a file exists at: ${directory}`);
      }
      await connection.execute(
        `INSERT IGNORE INTO ${this.table} (path, kind, created_at) VALUES (?, 'directory', CURRENT_TIMESTAMP(3))`,
        [directory]
      );
    }
  }

  async list(dirPath) {
    const normalizedPath = normalizePath(dirPath);
    const connection = await this.getConnection();
    const [rows] = await connection.execute(
      `SELECT path FROM ${this.table} WHERE path LIKE ?`,
      [`${normalizedPath}/%`]
    );
    return rows
      .map(row => row.path)
      .filter(filePath => !filePath.slice(normalizedPath.length + 1).includes('/'));
  }

  async close() {
    if (this.connection) await this.connection.end();
    this.connection = null;
    this.ready = null;
  }

  get name() {
    return 'MySqlStorage';
  }
}

module.exports = MySqlStorage;
