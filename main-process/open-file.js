const {ipcMain, dialog} = require('electron');
const {readCSV} = require('./utils/csv-reader');
const BankStatementDAO = require('./dao/bank-statement-dao');
const {OPEN_FILE_CHANNEL, SELECTED_FILE_CHANNEL, LOAD_FILE_CHANNEL} = require('../constants/channels');

class OpenFileMain {
  windowOptions = {
    properties: ['openFile'],
    filters: [{'name': 'CSV', 'extensions': ['csv']}]
  };

  start() {
    this.listenOnOpenFileChannel();
    this.listenOnLoadFileChannel();
  }

  listenOnOpenFileChannel() {
    ipcMain.on(OPEN_FILE_CHANNEL, (event) => {
      dialog.showOpenDialog(this.windowOptions).then(response => this.sendFileNameToRenderProcess(event, response));
    });
  }

  listenOnLoadFileChannel() {
    ipcMain.on(LOAD_FILE_CHANNEL, (event, selectedFile) => {
      console.info(`Loading bank statement for processing: ${selectedFile}`);
      let data = readCSV(selectedFile);
    });
  }

  sendFileNameToRenderProcess(event, response) {
    console.info(`Chosen file path: ${response.filePaths}`);
    if (response.filePaths.length) {
      event.sender.send(SELECTED_FILE_CHANNEL, response.filePaths[0])
    }
  }
}

openFileName = new OpenFileMain();
openFileName.start();
