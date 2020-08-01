let  { ipcMain, dialog } = require("electron");
const fs = require('fs');
const { Parser } = require('json2csv');

let channels = require("../constants/channels");
const {constructCategoryIdentifierDocument} = require("./dto/translation-utils");
let { getDao } = require("./dao/bank-statement-dao");

const log4js = require('log4js');
let log = log4js.getLogger("app");

class ProcessorMain {

    _loaded_statements = false;
    _uncategorized_statements = [];

    start() {
        this.bankStatementDAO = getDao();
        this.listOnStartAutoCategorizationChannel();
        this.listenOnLoadStatementEntryChannel();
        this.listenOnConfirmEntryClassificationChannel();
        this.listenOnExportCategorizedBankStatementsChannel();
        this.listenOnExportIdentifiersChannel();
        this.listenOnGetSavedCategorizations();
    }

    listOnStartAutoCategorizationChannel() {
        let channel = channels.REQUEST_START_AUTO_CLASSIFICATION;
        ipcMain.on(channel, (event) => {
            log.info('Request received on channel:', channel);
            this.updateAllAutoClassifiedEntries()
                .then(response => {
                    log.info('Response sent on channel:', channels.RESPONSE_START_AUTO_CLASSIFICATION);
                    event.sender.send(channels.RESPONSE_START_AUTO_CLASSIFICATION, response)
                })
        })
    }

    listenOnLoadStatementEntryChannel() {
        let channel = channels.REQUEST_LOAD_STATEMENT_ENTRY;
        ipcMain.on(channel, (event) => {
            log.info('Request received on channel:', channel);
           this.getStatementEntry()
               .then(entry => {
                   return this.getStatementCategorization(entry);
               })
               .then(classifications => {
                    log.info('Sending classification:', classifications);
                    log.info('Response sent on channel:', channels.RESPONSE_LOAD_STATEMENT_ENTRY);
                    event.sender.send(channels.RESPONSE_LOAD_STATEMENT_ENTRY, classifications);
                });
        });
    }

    listenOnGetSavedCategorizations() {
        let channel = channels.REQUEST_SAVED_CATEGORIZATIONS;
        ipcMain.on(channel, (event) => {
            log.info('Request received on channel:', channel);
            this.sendCategoriesMap(event)
                .then(() => log.info('Successfully sent category map to renderer.'));
        })
    }

    listenOnConfirmEntryClassificationChannel() {
        let channel = channels.REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION;
        ipcMain.on(channel, (event, statement) => {
            log.info('Request received on channel:', channel);
            log.info('Received categorized statement:', statement);

            let document = constructCategoryIdentifierDocument(statement);
            this.bankStatementDAO.insertCategorization(document)
                .then(() => this.bankStatementDAO.updateStatement(statement))
                .then(() => event.sender.send(channels.RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION, true));
        });
    }

    listenOnExportCategorizedBankStatementsChannel() {
        let channel = channels.REQUEST_EXPORT_CLASSIFICATIONS;
        ipcMain.on(channel, (event) => {
            log.info('Request received on channel:', channel);
            this.exportCategorizedStatements(event)
                .then(() => 'Exporting bank statements workflow complete.');
        });
    }

    listenOnExportIdentifiersChannel() {
        let channel = channels.REQUEST_EXPORT_IDENTIFIERS;
        ipcMain.on(channel, (event) => {
            log.info('Request received on channel:', channel);
            this.exportIdentifiers(event)
                .then(() => 'Exporting categorizations workflow complete.');
        });
    }

    async exportCategorizedStatements(event) {
        try {
            let uncategorizedEntries = await this.bankStatementDAO.getUncategorizedStatements();

            if (uncategorizedEntries.length > 0) {
                let options = {
                    type: 'info',
                    title: 'Information',
                    message: `Found ${uncategorizedEntries.length} uncategorized statements. First complete the categorization process.`,
                    buttons: ['Okay']
                };

                await dialog.showMessageBox(options);
                event.sender.send(channels.RESPONSE_EXPORT_CLASSIFICATIONS, false);
                return;
            }

            let documents = await this.bankStatementDAO.getCategorizedStatements();
            let formattedDocuments = this.formatConfirmedDocuments(documents);
            if (formattedDocuments != null && formattedDocuments.length > 0) {
                await this.exportToCSV(formattedDocuments);
            } else {
                let options = {
                    type: 'info',
                    title: 'Information',
                    message: `There is nothing to export.`,
                    buttons: ['Okay']
                };
                await dialog.showMessageBox(options);
                event.sender.send(channels.RESPONSE_EXPORT_CLASSIFICATIONS, false);
            }
        } catch (err) {
            log.error('Failed to complete export workflow:', err);
            dialog.showErrorBox('Statement Export Failed', err);
            event.sender.send(channels.RESPONSE_EXPORT_CLASSIFICATIONS, false);
        }
    }

    async exportIdentifiers(event) {
        try {
            let documents = await this.bankStatementDAO.getIdentifiers();
            let formattedDocuments = this.formatConfirmedDocuments(documents);
            if (formattedDocuments != null && formattedDocuments.length > 0) {
                await this.exportToCSV(formattedDocuments);
            }
        } catch (err) {
            log.error("Failed to export identifiers to CSV:", err);
            dialog.showErrorBox('Categories Export Failed', err);
            event.sender.send(channels.RESPONSE_EXPORT_IDENTIFIERS, err);
        }
    }

    async getStatementCategorization(entry) {
        if (!entry) {
            return null;
        }
        let entries = [];
        let categories = await this.bankStatementDAO.getStatementCategorization(entry);
        log.info(`Number of categories found: ${categories.length}`);
        for (let index = 0; index < categories.length; index++) {
            let category = categories[index];
            let entryCopy = await JSON.parse(JSON.stringify(entry));
            entryCopy.source = category.source;
            entryCopy.mainCategory = category.mainCategory;
            entryCopy.subCategory = category.subCategory;
            entryCopy.explanation = category.explanation;
            entryCopy.identifier = category.identifier;
            entryCopy.categorized = true;
            entries.push(entryCopy);
        }
        if (entries.length === 0) {
            entries.push(entry);
        }
        return entries.pop();  // FIXME: Heuristic to determine the best identified categorization and a way to display more data to the user
    }

    formatConfirmedDocuments(documents) {
        for (let index = 0; index < documents.length; index++) {
            let document = documents[index];
            log.info("Inspecting document:", documents);
            delete document._id;
            delete document._rev;
        }
        return documents;
    }

    async getStatementEntry() {
        let entry = null;
        if (this._uncategorized_statements.length === 0 || !this._loaded_statements) {
            this._uncategorized_statements = await this.bankStatementDAO.getUncategorizedStatements();
            this._loaded_statements = true;
        }
        if (this._uncategorized_statements.length > 0) {
            log.info("Entries exist!");
            entry = this._uncategorized_statements.pop();
        }
        log.info('Loading entry:', entry);
        return entry;
    }

    async updateAllAutoClassifiedEntries() {
        let uncategorizedEntries = await this.bankStatementDAO.getUncategorizedStatements();
        let categorizedEntries = await this.bankStatementDAO.getCategorizedStatements();
        let entry = (uncategorizedEntries.length > 0) ? uncategorizedEntries.pop() : null;
        let successCount = categorizedEntries.length;
        let failCount = 0;
        while (entry) {
            let categorizedEntry = await this.getStatementCategorization(entry);
            if (categorizedEntry == null || !categorizedEntry.mainCategory) {
                log.info("No auto classification found for:", entry.description);
                failCount++;
                entry = uncategorizedEntries.pop();
                continue;
            }
            successCount++;
            await this.bankStatementDAO.updateStatement(categorizedEntry);
            entry = uncategorizedEntries.pop();
        }
        return {
            successCount: successCount,
            failCount: failCount
        }
    }

    async exportToCSV(documents) {
        let header = this.getHeader();
        let json2CSVParser = this.getCSVParser(header);
        let csv = json2CSVParser.parse(documents);
        let filePath = await this.getSavePath();
        if (!filePath) {
            log.info("User canceled export.");
            return;
        }
        fs.writeFile(filePath, csv, (err) => {
            if (err) {
                log.error("Failed to write CSV file:", err);
            }
            log.log('Finished CSV export workflow');
        });
    }

    async getSavePath() {
        let options = {
            title: 'Bank Statement',
            filters: [
                { name: 'categorized_bank_statement', extensions: ['csv'] }
            ]
        };
        let saveDialogReturnValue = await dialog.showSaveDialog(options);
        return saveDialogReturnValue.filePath;
    }

    getCSVParser(header) {
        return new Parser({ header });
    }

    getHeader() {
        return ['transactionDate', 'description', 'amount', 'balance', 'source', 'mainCategory', 'subCategory', 'explanation'];
    }

    async sendCategoriesMap(event) {
        let categoryEntries = await this.bankStatementDAO.getIdentifiers();

        let source = categoryEntries[0]['source'];
        let category = categoryEntries[0]['mainCategory'];
        let subCategory = categoryEntries[0]['subCategory'];

        let subCategorySet = new Set();
        subCategorySet.add(subCategory);
        let mainCategoryMap = new Map();
        mainCategoryMap.set(category, subCategorySet);
        let sourceCategoryMap = new Map();
        sourceCategoryMap.set(source, mainCategoryMap);

        for (let row = 1; row < categoryEntries.length; row++) {
            let source = categoryEntries[row]['source'];
            let category = categoryEntries[row]['mainCategory'];
            let subCategory = categoryEntries[row]['subCategory'];
            log.info(subCategory);

            if (sourceCategoryMap.has(source)) {
                let categoryMap = sourceCategoryMap.get(source);
                if (categoryMap.has(category)) {
                    let subCategorySet = categoryMap.get(category);
                    subCategorySet.add(subCategory);
                    categoryMap.set(category, subCategorySet);
                } else {
                    let subCategorySet = new Set();
                    subCategorySet.add(subCategory);
                    categoryMap.set(category, subCategorySet);
                }
                sourceCategoryMap.set(source, categoryMap);
            } else {
                let subCategorySet = new Set();
                subCategorySet.add(subCategory);
                let categoryMap = new Map();
                categoryMap.set(category, subCategorySet);
                sourceCategoryMap.set(source, categoryMap);
            }
        }
        log.info(sourceCategoryMap);
        event.returnValue = sourceCategoryMap;
    }
}

let processorMain = new ProcessorMain();
processorMain.start();
