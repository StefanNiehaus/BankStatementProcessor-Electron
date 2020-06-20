let  { ipcMain, dialog } = require("electron");
const fs = require('fs');
const { Parser } = require('json2csv');

let channels = require("../constants/channels");
const {constructCategoryIdentifierDocument} = require("./dto/translation-utils");
let { getDao } = require("./dao/bank-statement-dao");

class ProcessorMain {

    _loaded_statements = false;
    _uncategorized_statements = [];

    start() {
        this.bankStatementDAO = getDao();
        this.listenOnLoadStatementEntryChannel();
        this.listenOnConfirmEntryClassificationChannel();
        this.listenOnConfirmAllClassificationsChannel();
        this.listenOnExportClassificationChannel();
    }

    listenOnLoadStatementEntryChannel() {
        let channel = channels.REQUEST_LOAD_STATEMENT_ENTRY;
        ipcMain.on(channel, (event) => {
            console.info('Request received on channel:', channel);
           this.getStatementEntry()
               .then(entry => { return this.getStatementCategorization(entry); })
               .then(classifications => {
                    console.info('Sending classification:', classifications);
                    console.info('Response sent on channel:', channels.RESPONSE_LOAD_STATEMENT_ENTRY);
                    event.sender.send(channels.RESPONSE_LOAD_STATEMENT_ENTRY, classifications);
                });
        });
    }

    listenOnConfirmEntryClassificationChannel() {
        let channel = channels.REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION;
        ipcMain.on(channel, (event, statement) => {
            console.info('Request received on channel:', channel);
            console.info('Received categorized statement:', statement);

            let document = constructCategoryIdentifierDocument(statement);
            this.bankStatementDAO.insertCategorization(document)
                .then(() => this.bankStatementDAO.updateStatement(statement))
                .then(() => event.sender.send(channels.RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION, true));
        });
    }

    listenOnConfirmAllClassificationsChannel() {
        let channel = channels.REQUEST_CONFIRM_CLASSIFICATIONS;

        ipcMain.on(channel, (event) => {
            console.info('Request received on channel:', channel);
            let documentsPromise = this.bankStatementDAO.getStatements(true);
            documentsPromise
                .then(documents => {
                    console.info("Retrieved all categorized statements. Count:", documents.length);
                    let formattedDocuments = this.formatConfirmedDocuments(documents);
                    this.bankStatementDAO.bulkInsertConfirmedCategorizedStatement(formattedDocuments)
                        .then(() => console.info("Saved all categorized bank statements"));
                })
                .then(() => {
                    let docsPromise = this.bankStatementDAO.getConfirmedStatements();
                    docsPromise
                        .then(docs => console.info("Number of confirmed documents:", docs.length))
                        .then(() => this.bankStatementDAO.removeDocuments(true))
                        .then(() => console.info("Removed all categorized bank statements"));
                    event.sender.send(channels.RESPONSE_CONFIRM_CLASSIFICATIONS, true);
                })
                .catch(err => {
                    console.error("Failed to complete saving all categorized statements workflow:", err);
                    event.sender.send(channels.RESPONSE_CONFIRM_CLASSIFICATIONS, false);
                });
        });
    }

    listenOnExportClassificationChannel() {
        let channel = channels.REQUEST_EXPORT_CLASSIFICATIONS;
        ipcMain.on(channel, (event) => {
            console.info('Request received on channel:', channel);
            let docsPromise = this.bankStatementDAO.getConfirmedStatements();
            docsPromise
                .then(documents => {
                    let formattedDocuments = this.formatConfirmedDocuments(documents);
                    this.exportToCSV(formattedDocuments)
                        .then(() => event.sender.send(channels.RESPONSE_EXPORT_CLASSIFICATIONS, true))
                })
                .catch(err => {
                    console.error("Failed to complete export workflow:", err);
                    event.sender.send(channels.RESPONSE_EXPORT_CLASSIFICATIONS, false);
                });
        });
    }

    async getStatementCategorization(entry) {
        if (!entry) {
            return null;
        }
        let entries = [];
        let categories = await this.bankStatementDAO.getStatementCategorization(entry);
        console.info(`Number of categories found: ${categories.length}`);
        for (let index = 0; index < categories.length; index++) {
            let category = categories[index];
            let entryCopy = await JSON.parse(JSON.stringify(entry));
            entryCopy.source = category.source;
            entryCopy.mainCategory = category.mainCategory;
            entryCopy.subCategory = category.subCategory;
            entryCopy.explanation = category.explanation;
            entryCopy.identifier = category.identifier;
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
            console.info("Inspecting document:", documents);
            delete document._id;
            delete document._rev;
        }
        return documents;
    }

    async getStatementEntry() {
        let entry = null;
        if (this._uncategorized_statements.length === 0 || !this._loaded_statements) {
            this._uncategorized_statements = await this.bankStatementDAO.getStatements(false);
            this._loaded_statements = true;
        }
        if (this._uncategorized_statements.length > 0) {
            console.info("Entries exist!");
            entry = this._uncategorized_statements.pop();
        }
        console.info('Loading entry:', entry);
        return entry;
    }

    async exportToCSV(documents) {
        let header = this.getHeader();
        let json2CSVParser = this.getCSVParser(header);
        let csv = json2CSVParser.parse(documents);
        let filePath = await this.getSavePath();
        if (!filePath) {
            console.info("User canceled export.");
            return;
        }
        fs.writeFile(filePath, csv, (err) => {
            if (err) {
                console.error("Failed to write CSV file:", err);
            }
            console.log('Finished CSV export workflow');
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
}

let processorMain = new ProcessorMain();
processorMain.start();
