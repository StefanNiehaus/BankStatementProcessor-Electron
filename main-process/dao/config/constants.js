
// Database constants
const DATABASE_NAME = 'bank_statements_db';
const DATABASE_PLUGIN_NAME = 'pouchdb-adapter-leveldb';
const ADAPTOR = require('leveldown');

// Collection constants
const COLLECTION_STATEMENTS_UNCONFIRMED = 'statements_collection';
const COLLECTION_CATEGORIZATION = 'categories_collection';
const COLLECTION_STATEMENTS_CONFIRMED = 'statements_collection_classified';

module.exports = {
    ADAPTOR,
    DATABASE_PLUGIN_NAME,
    DATABASE_NAME,
    COLLECTION_STATEMENTS_UNCONFIRMED,
    COLLECTION_STATEMENTS_CONFIRMED,
    COLLECTION_CATEGORIZATION
};
