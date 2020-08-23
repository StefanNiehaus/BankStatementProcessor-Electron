let RxDB = require('rxdb');

let constants = require('./config/constants');
let schemas = require('./config/schemas');

let log = require('electron-log');


RxDB.plugin(require(constants.DATABASE_PLUGIN_NAME));

class BankStatementsDAO {


    /**
     * Configuration for database
     */
    DB_CONFIG = {
        name: constants.DATABASE_NAME,
        adapter: constants.ADAPTOR
    };

    /**
     * Configuration for each collection
    * */
    COLLECTION_STATEMENTS_CONFIG = {
        name: constants.COLLECTION_STATEMENTS_UNCONFIRMED,
        schema: schemas.bankStatementSchema,
    };
    COLLECTION_CATEGORIES_CONFIG = {
        name: constants.COLLECTION_CATEGORIZATION,
        schema: schemas.categorizationsSchema,
    };

    /**
     * Steps to take:
     * - Initialize database
     * - Initialize each collection for the database
     * */
    async start() {
        await this.initDataBase();
        await this.initStatementsCollection();
        await this.initCategoriesCollection();
    }

    async initDataBase() {
        log.info('Initializing database');
        this.db = await RxDB.create(this.DB_CONFIG);
        log.info('Initialized database');
    }

    async initStatementsCollection() {
        log.info('Initializing bank statements collection');
        this.statementsCollection = await this.db.collection(this.COLLECTION_STATEMENTS_CONFIG);
        log.info('Initialized bank statements collection');
    }

    async initCategoriesCollection() {
        log.info('Initializing categorizations collection');
        this.categoriesCollection = await this.db.collection(this.COLLECTION_CATEGORIES_CONFIG);
        log.info('Initialized categorizations collection');
    }

    /**
     * Bulk save statements in temporary collection with all recently loaded statements.
     * */
    async bulkInsertStatement(documents) {
        return this.statementsCollection
            .bulkInsert(documents)
            .then(() => log.info('Successfully performed bulk insert of local bank statements'))
            .catch(err => log.info(err));
    }

    /**
     * Bulk save categories in temporary collection with all recently loaded statements.
     * */
    async bulkInsertCategorizations(documents) {
        return this.categoriesCollection
            .bulkInsert(documents)
            .then(() => log.info('Successfully performed bulk insert of categories'))
            .catch(err => log.info(err));
    }

    /**
     * Save categorization set with the corresponding identifier.
     * */
    async insertCategorization(document) {
        if (!document.identifier) {
            log.info('Category identifier is blank. No new identifier was added.');
            return null;
        }
        return this.categoriesCollection
            .insert(document)
            .then(() => log.info('Successfully saved new categorization identifier'))
            .catch(err => log.info(err));
    }

    /**
     * Update temporary statement with categorization. TODO: Validate that this will only perform updates!
     * */
    async updateStatement(document) {
        log.info("Updating document:", document);
        return this.statementsCollection
            .upsert(document)
            .then(() => log.info('Successfully saved confirmed categorized statement'))
            .catch(err => log.info(err));
    }

    /**
     * Retrieve all of the statements without a categorization.
     * */
    async getUncategorizedStatements() {
        let documents = await this.statementsCollection
            .find()
            .where('categorized')
            .equals(false)
            .exec();

        log.info(`Found ${documents.length} uncategorized documents`);
        return this.convertToJson(documents);
    }

    /**
     * Retrieve a statements without a categorization.
     * */
    async getUncategorizedStatement() {
        let document = await this.statementsCollection
            .findOne()
            .where('categorized')
            .equals(false)
            .exec();

        let jsonDoc = document.toJSON();
        log.info('Found uncategorized document:', jsonDoc);
        return jsonDoc;
    }

    /**
     * Retrieve all of the statements with a categorization.
     * */
    async getCategorizedStatements() {
        let documents = await this.statementsCollection
            .find()
            .where('categorized')
            .equals(true)
            .exec();

        log.info(`Found ${documents.length} confirmed categorized documents`);
        return this.convertToJson(documents);
    }

    /**
     * Retrieve all saved identifiers
    * */
    async getIdentifiers() {
        let rawIdentifiers = await this.categoriesCollection.find().exec();
        return this.convertToJson(rawIdentifiers);
    }

    /**
     * Determine all potential statement categorization sets that match the description.
     * */
    async getStatementCategorization(entry) {
        let categoryMatches = [];
        let rawDocuments = await this.categoriesCollection.find().exec();
        let documents = this.convertToJson(rawDocuments);
        log.info("Entry Description:", entry.description);
        for (let index = 0; index < documents.length; index++) {
            let categoryCandidate = documents[index];
            if (entry.description.toLowerCase().includes(categoryCandidate.identifier.toLowerCase())) {
                log.info("Found matching identifier:", categoryCandidate.identifier);
                categoryMatches.push(categoryCandidate);
            }
        }
        log.info(`Found ${categoryMatches.length} category identifiers`);
        return categoryMatches;
    }

    /**
     * Clear temporary collection with all recently loaded statements.
     * */
    async removeBankStatementDocuments() {
        return this.statementsCollection
            .find()
            .remove()
            .then((removedDocs) => log.info(`Removed ${removedDocs.length} bank statement documents.`));
    }

    /**
     * Clear temporary collection with all recently loaded statements.
     * */
    async removeCategoryDocuments() {
        return this.categoriesCollection
            .find()
            .remove()
            .then((removedDocs) => log.info(`Removed ${removedDocs.length} category documents.`));
    }

    /**
     * Convenience method to convert all documents to JSON format.
     * */
    convertToJson(documents) {
        let jsonDocuments = [];
        for (let index = 0; index < documents.length; index++) {
            jsonDocuments.push(documents[index].toJSON())
        }
        return jsonDocuments;
    }
}

let _databaseDAO; // cached

function getDao() {
    if (!_databaseDAO) {
        _databaseDAO = new BankStatementsDAO();
        _databaseDAO.start().then(/* Nothing */);
    }
    return _databaseDAO;
}

module.exports = {
    getDao
};
