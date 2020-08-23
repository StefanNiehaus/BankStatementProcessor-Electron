const {ipcRenderer} = require("electron");
const settings = require("electron-settings");

const channels = require("../constants/channels");
const settingKeys = require("../constants/settings");
const viewElements = require("./constants/view-elements");

const Navigation = require("../assets/scripts/navigation");

let log = require('electron-log');

class OpenFileRenderer {
  selectDirBtn = document.getElementById(viewElements.BUTTON_LOAD_STATEMENT_FILE);
  selectIdentifiersBtn = document.getElementById(viewElements.BUTTON_LOAD_IDENTIFIERS);
  confirmConfigBtn = document.getElementById(viewElements.BUTTON_CONFIRM_CONFIGURATION);
  navigation = new Navigation();

  start() {
    this.loadDefaults();
    this.listenForOpenFileClick();
    this.listenOnOpenFileChannel();
    this.listenForConfigConfirmationClick();
    this.listenForLoadIdentifiersClick();
    this.listenOnLoadIdentifiersChannel();
  }

  listenForOpenFileClick() {
    let channel = channels.REQUEST_SELECT_STATEMENT_FILE;
    this.selectDirBtn.addEventListener('click', () => {
      log.info('Request sent on channel:', channel);
      let success = ipcRenderer.sendSync(channels.REQUEST_DELETE_STATEMENTS);
      document.getElementById(viewElements.DATA_BANK_STATEMENT_FILE).innerHTML = null;
      if (!success) {
        log.error('Failed to clear current bank statements loaded in the application.');
        return;
      }
      ipcRenderer.send(channel);
    });
  }

  listenOnOpenFileChannel() {
    let channel = channels.RESPONSE_SELECT_STATEMENT;
    ipcRenderer.on(channel, (event, path) => {
      log.info('Response received on channel:', channel);
      log.info(`Received path information: ${path}`);
      document.getElementById(viewElements.DATA_BANK_STATEMENT_FILE).innerHTML = String(path);
    });
  }

  listenForLoadIdentifiersClick() {
    this.selectIdentifiersBtn.addEventListener('click', () => {
      log.info(`Sending load identifiers file event from renderer process to main process`);
      let success = ipcRenderer.sendSync(channels.REQUEST_DELETE_CATEGORIZATIONS);
      document.getElementById(viewElements.DATA_IDENTIFIERS_FILE).innerHTML = null;
      if (!success) {
        log.error('Failed to clear current identifiers loaded in the application.');
        return;
      }
      ipcRenderer.send(channels.REQUEST_SELECT_IDENTIFIERS_FILE);
    });
  }

  listenOnLoadIdentifiersChannel() {
    let channel = channels.RESPONSE_LOAD_IDENTIFIERS;
    ipcRenderer.on(channel, (event, path) => {
      log.info('Response received on channel:', channel);
      log.info(`Received path information: ${path}`);
      document.getElementById(viewElements.DATA_IDENTIFIERS_FILE).innerHTML = String(path);
    });
  }

  listenForConfigConfirmationClick() {
    this.confirmConfigBtn.addEventListener('click', () => {
      log.info(`Confirmed Config`);
      let bankStatementConfig = this.getBankStatementLoadConfig();
      let identifierFileLoadConfig = this.getIdentifierFileLoadConfig();
      if (!this.validConfiguration(bankStatementConfig, identifierFileLoadConfig)) {
        log.warn("User input configuration is not complete.");
        return;
      }
      ipcRenderer.send(channels.REQUEST_LOAD_STATEMENT, bankStatementConfig);
      ipcRenderer.send(channels.REQUEST_LOAD_IDENTIFIERS, identifierFileLoadConfig);
      this.navigation.loadSection(viewElements.SECTION_PROCESSOR);
    });
  }

  /**
   * User defines the load config for the bank statement. The user settings are persisted to ease the configuration.
  * */
  getBankStatementLoadConfig() {
    let bankStatementSource = document.getElementById(viewElements.DATA_STATEMENT_SOURCE_INPUT).value;
    let bankStatementFile = document.getElementById(viewElements.DATA_BANK_STATEMENT_FILE).innerHTML;
    let r_start = document.getElementById('row-start');
    let c_transaction_date = document.getElementById('column-transaction-date');
    let c_description = document.getElementById('column-description');
    let c_amount = document.getElementById('column-amount');
    let c_balance = document.getElementById('column-balance');
    let config = {
      source: String(bankStatementSource),
      filePath: String(bankStatementFile),
      startRowIndex: parseInt(r_start.options[r_start.selectedIndex].text) - 1,
      columnDateIndex: parseInt(c_transaction_date.options[c_transaction_date.selectedIndex].text) - 1,
      columnDescriptionIndex: parseInt(c_description.options[c_description.selectedIndex].text) - 1,
      columnAmountIndex: parseInt(c_amount.options[c_amount.selectedIndex].text) - 1,
      columnBalanceIndex: parseInt(c_balance.options[c_balance.selectedIndex].text) - 1,
    };
    this.saveBankStatementLoadConfig(config);
    return config;
  }

  saveBankStatementLoadConfig(config) {
    settings.set(settingKeys.ROW_START, config.startRowIndex);
    settings.set(settingKeys.COLUMN_TRANSACTION_DATE, config.columnDateIndex);
    settings.set(settingKeys.COLUMN_DESCRIPTION, config.columnDescriptionIndex);
    settings.set(settingKeys.COLUMN_AMOUNT, config.columnAmountIndex);
    settings.set(settingKeys.COLUMN_BALANCE, config.columnBalanceIndex);
  }

  /**
   * User defines the load config for the identifiers file. The user settings are persisted to ease the configuration.
   * */
  getIdentifierFileLoadConfig() {
    let identifiersFile = document.getElementById(viewElements.DATA_IDENTIFIERS_FILE).innerHTML;
    return {
      filePath: String(identifiersFile),
      startRowIndex: 1,
      typeIndex: 0,
      categoryIndex: 1,
      subCategoryIndex: 2,
      identifierIndex: 3
    };
  }

  //  TODO: Load default config for bank statement and identifier files
  loadDefaults() {
    settings.get(settingKeys.ROW_START);
    settings.get(settingKeys.COLUMN_TRANSACTION_DATE);
    settings.get(settingKeys.COLUMN_DESCRIPTION);
    settings.get(settingKeys.COLUMN_AMOUNT);
    settings.get(settingKeys.COLUMN_BALANCE);
  }

  validConfiguration(bankStatementConfig, identifierFileLoadConfig) {
    return (bankStatementConfig.source
        && bankStatementConfig.filePath
        && identifierFileLoadConfig.filePath);
  }
}

openFileRenderer = new OpenFileRenderer();
openFileRenderer.start();
