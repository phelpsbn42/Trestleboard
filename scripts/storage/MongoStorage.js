const StorageProvider = require('./StorageProvider');
const { normalizePath, parentPaths } = require('./path-utils');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * MongoDB-backed implementation of the path-based storage interface.
 *
 * Files and directories are stored as individual documents so the existing
 * project layout remains addressable by its familiar paths.
 */
class MongoStorage extends StorageProvider {
  constructor({ connectionString, database, collection = 'files', clientFactory } = {}) {
    super();
    if (!connectionString) throw new Error('MongoStorage requires a connection string');
    if (!database) throw new Error('MongoStorage requires a database name');

    this.connectionString = connectionString;
    this.databaseName = database;
    this.collectionName = collection;
    this.clientFactory = clientFactory || (uri => {
      const { MongoClient } = require('mongodb');
      return new MongoClient(uri);
    });
    this.client = null;
    this.files = null;
  }

  async getCollection() {
    if (this.files) return this.files;
    this.client = this.client || this.clientFactory(this.connectionString);
    await this.client.connect();
    this.files = this.client.db(this.databaseName).collection(this.collectionName);
    return this.files;
  }

  async exists(filePath) {
    const files = await this.getCollection();
    return Boolean(await files.findOne({ _id: normalizePath(filePath) }, { projection: { _id: 1 } }));
  }

  async read(filePath) {
    const files = await this.getCollection();
    const document = await files.findOne({ _id: normalizePath(filePath), kind: 'file' });
    if (!document) throw new Error(`File not found: ${filePath}`);
    return document.content;
  }

  async write(filePath, content) {
    const normalizedPath = normalizePath(filePath);
    const parents = parentPaths(normalizedPath);
    if (parents.length) await this.mkdir(parents[parents.length - 1]);
    const files = await this.getCollection();
    const existing = await files.findOne({ _id: normalizedPath }, { projection: { kind: 1 } });
    if (existing && existing.kind === 'directory') {
      throw new Error(`Cannot write file because a directory exists at: ${filePath}`);
    }

    await files.updateOne(
      { _id: normalizedPath },
      {
        $set: {
          kind: 'file',
          content: String(content),
          updated_at: new Date()
        },
        $setOnInsert: { created_at: new Date() }
      },
      { upsert: true }
    );
  }

  async mkdir(dirPath) {
    const normalizedPath = normalizePath(dirPath);
    const files = await this.getCollection();
    const directories = [...parentPaths(normalizedPath), normalizedPath];

    for (const directory of directories) {
      const existing = await files.findOne({ _id: directory }, { projection: { kind: 1 } });
      if (existing && existing.kind === 'file') {
        throw new Error(`Cannot create directory because a file exists at: ${directory}`);
      }
      await files.updateOne(
        { _id: directory },
        { $setOnInsert: { kind: 'directory', created_at: new Date() } },
        { upsert: true }
      );
    }
  }

  async list(dirPath) {
    const normalizedPath = normalizePath(dirPath);
    const files = await this.getCollection();
    const expression = new RegExp(`^${escapeRegex(normalizedPath)}/[^/]+$`);
    const documents = await files.find({ _id: expression }, { projection: { _id: 1 } }).toArray();
    return documents.map(document => document._id);
  }

  async close() {
    if (this.client) await this.client.close();
    this.client = null;
    this.files = null;
  }

  get name() {
    return 'MongoStorage';
  }
}

module.exports = MongoStorage;
