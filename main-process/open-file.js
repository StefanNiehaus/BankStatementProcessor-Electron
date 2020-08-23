const {ipcMain, dialog} = require('electron');

const channels = require('../constants/channels');

const {getDao} = require("./dao/bank-statement-dao");
const {constructIdentifierDocument, constructDocument, formatStatement} = require('./dto/translation-utils');
const {readCSV} = require('./utils/csv-reader');

let log = require('electron-log');

class OpenFileMain {
  WINDOW_OPTIONS = {
    properties: ['openFile'],
    filters: [{'name': 'CSV', 'extensions': ['csv']}]
  };

  start() {
    this.bankStatementDAO = getDao();
    this.listenOnSelectBankStatementFileChannel();
    this.listenOnLoadBankStatementChannel();
    this.listenOnSelectIdentifiersFileChannel();
    this.listenOnLoadIdentifiersChannel();
    this.listenOnDeleteBankStatementsChannel();
    this.listenOnDeleteIdentifiersChannel();
  }

  listenOnSelectBankStatementFileChannel() {
    let channel = channels.REQUEST_SELECT_STATEMENT_FILE;
    ipcMain.on(channel, (event) => {
      log.info('Request received on channel:', channel);
      dialog.showOpenDialog(this.WINDOW_OPTIONS).then(response =>
          this.sendFileNameToRenderProcess(event, response, channels.RESPONSE_SELECT_STATEMENT));
    });
  }

  listenOnSelectIdentifiersFileChannel() {
    let channel = channels.REQUEST_SELECT_IDENTIFIERS_FILE;
    ipcMain.on(channel, (event) => {
      log.info('Request received on channel:', channel);
      dialog.showOpenDialog(this.WINDOW_OPTIONS).then(response =>
          this.sendFileNameToRenderProcess(event, response, channels.RESPONSE_LOAD_IDENTIFIERS));
    });
  }

  listenOnLoadBankStatementChannel() {
    ipcMain.on(channels.REQUEST_LOAD_STATEMENT, (event, loadConfig) => {
      log.info(`Loading bank statement for processing: ${loadConfig.filePath}`);
      if (!loadConfig.filePath) {
        log.info("No bank statement file selected.")
      }
      readCSV(loadConfig.filePath, (data) => this.processBankStatement(data, loadConfig));
    });
  }

  listenOnLoadIdentifiersChannel() {
    ipcMain.on(channels.REQUEST_LOAD_IDENTIFIERS, (event, loadConfig) => {
      let filePath = loadConfig.filePath;
      log.info(`Loading identifiers file for processing: ${filePath}`);
      if (!filePath) {
        log.info("No identifiers file selected.")
      }
      readCSV(filePath, (data) => this.processIdentifiersFile(data, loadConfig));
    });
  }

  listenOnDeleteBankStatementsChannel() {
    ipcMain.on(channels.REQUEST_DELETE_STATEMENTS, (event) => {
      this.bankStatementDAO.removeBankStatementDocuments().then(() => {
        event.returnValue = true;
      })
    });
  }

  listenOnDeleteIdentifiersChannel() {
    ipcMain.on(channels.REQUEST_DELETE_CATEGORIZATIONS, (event) => {
      this.bankStatementDAO.removeCategoryDocuments().then(() => {
        event.returnValue = true;
      })
    });
  }

  async processBankStatement(data, loadConfig) {
    log.info("Processing bank statement file");
    let start = loadConfig.startRowIndex;
    let documents = [];
    for (let i = start; i < data.length; i++) {
      let statement = formatStatement(data[i], loadConfig);
      let document = constructDocument(statement, loadConfig);
      documents.push(document);
    }
    return await this.bankStatementDAO.bulkInsertStatement(documents);
  }

  async processIdentifiersFile(data, loadConfig) {
    log.info("Processing identifiers file");
    let start = loadConfig.startRowIndex;
    let identifiers = [];
    for (let i = start; i < data.length; i++) {
      let identifierDocument = constructIdentifierDocument(data[i], loadConfig);
      identifiers.push(identifierDocument);
    }
    return await this.bankStatementDAO.bulkInsertCategorizations(identifiers);
  }

  sendFileNameToRenderProcess(event, response, channel) {
    log.info(`Chosen file path: ${response.filePaths}`);
    if (response.filePaths.length) {
      event.sender.send(channel, response.filePaths[0])
    }
  }
}

openFileName = new OpenFileMain();
openFileName.start();
