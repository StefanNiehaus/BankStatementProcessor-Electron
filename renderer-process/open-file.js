const {ipcRenderer} = require('electron');
const settings = require('electron-settings');
const channels = require('../constants/channels');
const settingKeys = require('../constants/settings');

class OpenFileRenderer {
  selectDirBtn = document.getElementById('select-file');
  confirmConfigBtn = document.getElementById('confirm-input-configuration');

  start() {
    this.listenForOpenFileClick();
    this.listenOnSelectedFileChannel();
    this.listenForConfigConfirmationClick();
  }

  listenForOpenFileClick() {
    this.selectDirBtn.addEventListener('click', () => {
      console.info(`Sending open file event from renderer process to main process`);
      ipcRenderer.send(channels.OPEN_FILE_CHANNEL);
    });
  }

  listenOnSelectedFileChannel() {
    ipcRenderer.on(channels.SELECTED_FILE_CHANNEL, (event, path) => {
      console.info(`Received path information: ${path}`);
      document.getElementById('selected-file').innerHTML = String(path);
    });
  }

  listenForConfigConfirmationClick() {
    this.saveBankStatementLoadConfig();
    this.confirmConfigBtn.addEventListener('click', () => {
      console.info(`Confirmed Config`);
      let selectedFile = document.getElementById('selected-file').innerHTML;
      ipcRenderer.send(channels.LOAD_FILE_CHANNEL, selectedFile);
    });
  }

  saveBankStatementLoadConfig() {
    let c_transaction_date = document.getElementById('column-transaction-date');
    let c_description = document.getElementById('column-description');
    let c_amount = document.getElementById('column-amount');
    let c_balance = document.getElementById('column-balance');
    settings.set(settingKeys.COLUMN_TRANSACTION_DATE, parseInt(c_transaction_date.options[c_transaction_date.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_DESCRIPTION, parseInt(c_description.options[c_description.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_AMOUNT, parseInt(c_amount.options[c_amount.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_BALANCE, parseInt(c_balance.options[c_balance.selectedIndex].text) - 1);
  }
}

openFileRenderer = new OpenFileRenderer();
openFileRenderer.start();
