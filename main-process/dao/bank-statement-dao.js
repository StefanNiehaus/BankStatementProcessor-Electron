const RxDB = require('rxdb');
let { adaptor, pluginName, databaseName, collectionName } = require('./config/constants');
let { bankStatementSchema } = require('./config/schemas');
let { formatStatement, constructDocument } = require('./utils/translation-utils');


RxDB.plugin(require(pluginName));

class BankStatementsDAO {
    databaseConfig = {name: databaseName, adapter: adaptor};
    collectionConfig = {name: collectionName, schema: bankStatementSchema};

    constructor() {
        this.initDataBase().then(() => this.initCollection());
        this.collection = null;
        this.db = null;
    }

    async save(data) {
        for (let i = 0; i < data.length; i++) {
            let statement = formatStatement(data[i]);
            await this.saveLine(statement);
        }
    }

    async saveLine(statement) {
        console.info('Saving bank statement');
        let document = constructDocument(statement);
        await this.collection
            .insert(document)
            .then(() => console.info('Successfully saved line'))
            .catch(err => console.info(err));
        console.info('Successfully saved bank statement')
    }

    async initDataBase() {
        this.db = await RxDB.create(this.databaseConfig);
        console.info(`Initialized bank statement database: ${this.db}`);
        return this.db;
    }

    async initCollection() {
        this.collection = await this.db.collection(this.collectionConfig);
        console.info(`Initialized bank statements collection: ${this.collection}`);
        return this.collection;
    }
}

module.exports = {
    BankStatementsDAO
};
