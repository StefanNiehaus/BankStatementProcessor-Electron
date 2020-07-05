const settings = require('electron-settings');
const {ipcMain, dialog} = require('electron');

const channels = require('../constants/channels');
const settingKeys = require('../constants/settings');

const {getDao} = require("./dao/bank-statement-dao");
const {constructIdentifierDocument, constructDocument, formatStatement} = require('./dto/translation-utils');
const {readCSV} = require('./utils/csv-reader');

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
  }

  listenOnSelectBankStatementFileChannel() {
    ipcMain.on(channels.REQUEST_SELECT_STATEMENT_FILE, (event) => {
      dialog.showOpenDialog(this.WINDOW_OPTIONS).then(response =>
          this.sendFileNameToRenderProcess(event, response, channels.RESPONSE_SELECT_STATEMENT));
    });
  }

  listenOnSelectIdentifiersFileChannel() {
    let channel = channels.REQUEST_SELECT_IDENTIFIERS_FILE;
    ipcMain.on(channel, (event) => {
      console.info('Request received on channel:', channel);
      dialog.showOpenDialog(this.WINDOW_OPTIONS).then(response =>
          this.sendFileNameToRenderProcess(event, response, channels.RESPONSE_LOAD_IDENTIFIERS));
    });
  }

  listenOnLoadBankStatementChannel() {
    ipcMain.on(channels.REQUEST_LOAD_STATEMENT, (event, selectedFile) => {
      console.info(`Loading bank statement for processing: ${selectedFile}`);
      if (!selectedFile) {
        console.info("No bank statement file selected.")
      }
      // this.bankStatementDAO.removeBankStatementDocuments()
      readCSV(selectedFile, (data) => this.processBankStatement(data));
    });
  }

  listenOnLoadIdentifiersChannel() {
    ipcMain.on(channels.REQUEST_LOAD_IDENTIFIERS, (event, selectedFile, loadConfig) => {
      console.info(`Loading bank statement for processing: ${selectedFile}`);
      if (!selectedFile) {
        console.info("No identifiers file selected.")
      }
      // this.bankStatementDAO.removeCategoryDocuments().then(
      readCSV(selectedFile, (data) => this.processIdentifiersFile(data, loadConfig));
    });
  }

  async processBankStatement(data) {
    console.info("Processing bank statement file");
    let start = settings.get(settingKeys.ROW_START);
    let documents = [];
    for (let i = start; i < data.length; i++) {
      let statement = formatStatement(data[i]);
      let document = constructDocument(statement);
      documents.push(document);
    }
    return await this.bankStatementDAO.bulkInsertStatement(documents);
  }

  async processIdentifiersFile(data, loadConfig) {
    console.info("Processing identifiers file");
    let start = loadConfig.startRowIndex;
    let identifiers = [];
    for (let i = start; i < data.length; i++) {
      let identifierDocument = constructIdentifierDocument(data[i], loadConfig);
      identifiers.push(identifierDocument);
    }
    return await this.bankStatementDAO.bulkInsertCategorizations(identifiers);
  }

  sendFileNameToRenderProcess(event, response, channel) {
    console.info(`Chosen file path: ${response.filePaths}`);
    if (response.filePaths.length) {
      event.sender.send(channel, response.filePaths[0])
    }
  }
}

openFileName = new OpenFileMain();
openFileName.start();
