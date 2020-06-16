const {ipcRenderer} = require("electron");
const settings = require("electron-settings");

const channels = require("../constants/channels");
const settingKeys = require("../constants/settings");
const viewElements = require("./constants/view-elements");

const Navigation = require("../assets/scripts/navigation");

class OpenFileRenderer {
  selectDirBtn = document.getElementById('select-file');
  confirmConfigBtn = document.getElementById('confirm-input-configuration');
  navigation = new Navigation();

  start() {
    this.listenForOpenFileClick();
    this.listenOnSelectedFileChannel();
    this.listenForConfigConfirmationClick();
  }

  listenForOpenFileClick() {
    this.selectDirBtn.addEventListener('click', () => {
      console.info(`Sending open file event from renderer process to main process`);
      ipcRenderer.send(channels.REQUEST_SELECT_STATEMENT);
    });
  }

  listenOnSelectedFileChannel() {
    ipcRenderer.on(channels.RESPONSE_SELECT_STATEMENT, (event, path) => {
      console.info(`Received path information: ${path}`);
      document.getElementById('selected-file').innerHTML = String(path);
    });
  }

  listenForConfigConfirmationClick() {
    this.confirmConfigBtn.addEventListener('click', () => {
      this.saveBankStatementLoadConfig();
      console.info(`Confirmed Config`);
      let selectedFile = document.getElementById('selected-file').innerHTML;
      ipcRenderer.send(channels.REQUEST_LOAD_STATEMENT, selectedFile);
      this.navigation.loadSection(viewElements.SECTION_PROCESSOR);
    });
  }

  saveBankStatementLoadConfig() {
    let r_start = document.getElementById('row-start');
    let c_transaction_date = document.getElementById('column-transaction-date');
    let c_description = document.getElementById('column-description');
    let c_amount = document.getElementById('column-amount');
    let c_balance = document.getElementById('column-balance');
    settings.set(settingKeys.ROW_START, parseInt(r_start.options[r_start.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_TRANSACTION_DATE, parseInt(c_transaction_date.options[c_transaction_date.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_DESCRIPTION, parseInt(c_description.options[c_description.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_AMOUNT, parseInt(c_amount.options[c_amount.selectedIndex].text) - 1);
    settings.set(settingKeys.COLUMN_BALANCE, parseInt(c_balance.options[c_balance.selectedIndex].text) - 1);
  }
}

openFileRenderer = new OpenFileRenderer();
openFileRenderer.start();
