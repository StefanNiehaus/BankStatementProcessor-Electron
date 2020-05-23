
// Database constants
const DATABASE_NAME = 'bank_statements_db';
const PLUGIN_NAME = 'pouchdb-adapter-leveldb';
const ADAPTOR = require('leveldown');

// Collection constants
const COLLECTION_NAME = 'bank_statement_collection';

module.exports = {
    adaptor: ADAPTOR,
    pluginName: PLUGIN_NAME,
    databaseName: DATABASE_NAME,
    collectionName: COLLECTION_NAME
};
