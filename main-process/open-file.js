const settings = require('electron-settings');
const {ipcMain, dialog} = require('electron');

const channels = require('../constants/channels');
const settingKeys = require('../constants/settings');

const {getDao} = require("./dao/bank-statement-dao");
const {constructDocument, formatStatement} = require('./dto/translation-utils');
const {readCSV} = require('./utils/csv-reader');

class OpenFileMain {
  WINDOW_OPTIONS = {
    properties: ['openFile'],
    filters: [{'name': 'CSV', 'extensions': ['csv']}]
  };

  start() {
    this.bankStatementDAO = getDao();
    this.listenOnOpenFileChannel();
    this.listenOnLoadFileChannel();
  }

  listenOnOpenFileChannel() {
    ipcMain.on(channels.REQUEST_SELECT_STATEMENT, (event) => {
      dialog.showOpenDialog(this.WINDOW_OPTIONS).then(response => this.sendFileNameToRenderProcess(event, response));
    });
  }

  listenOnLoadFileChannel() {
    ipcMain.on(channels.REQUEST_LOAD_STATEMENT, (event, selectedFile) => {
      console.info(`Loading bank statement for processing: ${selectedFile}`);
      if (selectedFile) {
        this.bankStatementDAO.removeTemporaryCategorizationCollection()
            .then(readCSV(selectedFile, (data) => this.processBankStatement(data)))
      }
    });
  }

  async processBankStatement(data) {
    let start = settings.get(settingKeys.ROW_START);
    let documents = [];
    for (let i = start; i < data.length; i++) {
      let statement = formatStatement(data[i]);
      let document = constructDocument(statement);
      documents.push(document);
    }
    await this.bankStatementDAO.bulkInsertStatement(documents);
  }

  async insert(document) {
    await this.bankStatementDAO.insertStatement(document);
  }

  sendFileNameToRenderProcess(event, response) {
    console.info(`Chosen file path: ${response.filePaths}`);
    if (response.filePaths.length) {
      event.sender.send(channels.RESPONSE_SELECT_STATEMENT, response.filePaths[0])
    }
  }
}

openFileName = new OpenFileMain();
openFileName.start();
