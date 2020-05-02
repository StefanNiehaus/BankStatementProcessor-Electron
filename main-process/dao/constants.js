
const DATABASE_NAME = 'bank_statements';
const PLUGIN_NAME = 'pouchdb-adapter-leveldb';
const ADAPTOR = require('leveldown');

module.exports = {
    adaptor: ADAPTOR,
    pluginName: PLUGIN_NAME,
    databaseName: DATABASE_NAME
};
