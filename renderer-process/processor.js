const {ipcRenderer} = require("electron");

const channels = require("../constants/channels");
const viewElements = require("./constants/view-elements");

let log = require('electron-log');

class ProcessorRenderer {
  buttonStartAutoCategorization = document.getElementById(viewElements.BUTTON_START_AUTO_CATEGORIZATION);
  buttonLoadStatementEntry = document.getElementById(viewElements.BUTTON_LOAD_STATEMENT_ENTRY);
  buttonConfirmEntryClassification = document.getElementById(viewElements.BUTTON_CONFIRM_ENTRY_CLASSIFICATION);
  buttonExportBankStatements = document.getElementById(viewElements.BUTTON_EXPORT_BANK_STATEMENTS);
  buttonExportIdentifiers = document.getElementById(viewElements.BUTTON_EXPORT_IDENTIFIERS);

  labelTypeStatement = document.getElementById(viewElements.LABEL_TYPE_STATEMENT);
  labelCategoryStatement = document.getElementById(viewElements.LABEL_CATEGORY_STATEMENT);

  start() {
    // Channel Listeners
    this.listOnStartAutoCategorizationChannel();
    this.listenOnLoadStatementEntryChannel();
    this.listenOnConfirmEntryClassificationChannel();
    this.listenOnExportClassificationsChannel();
    this.listenOnExportIdentifiersChannel();

    // Event Listeners
    this.listForStartAutoCategorizationClick();
    this.listenForLoadStatementEntryClick();
    this.listenForConfirmEntryClassificationClick();
    this.listenForExportClassificationsClick();
    this.listenForExportIdentifiersClick();
    this.listenForLabelTypeChange();
    this.listenForLabelMainCategoryChange();

    this.statement = null;
    this.categoriesMap = new Map();
  }

  listForStartAutoCategorizationClick() {
    let channel = channels.REQUEST_START_AUTO_CLASSIFICATION;
    this.buttonStartAutoCategorization.addEventListener('click', () => {
      log.info('Request sent on channel:', channel);
      ipcRenderer.send(channel);
    })
  }

  listOnStartAutoCategorizationChannel() {
    let channel = channels.RESPONSE_START_AUTO_CLASSIFICATION;
    ipcRenderer.on(channel, (event, response) => {
      log.info('Response received on channel:', channel);
      document.getElementById(viewElements.DATA_AUTO_CATEGORIZATION_SUCCESS_COUNT).innerHTML = response.successCount;
      document.getElementById(viewElements.DATA_AUTO_CATEGORIZATION_FAIL_COUNT).innerHTML = response.failCount;
    })
  }

  listenForLoadStatementEntryClick() {
    let channel = channels.REQUEST_LOAD_STATEMENT_ENTRY;
    this.buttonLoadStatementEntry.addEventListener('click', () => {
      if (!this.allowLoadStatementEntryClick()) {
        log.info('Request not sent on channel:', channel);
        return;
      }
      log.info('Request sent on channel:', channel);
      ipcRenderer.send(channel);
    });
  }

  listenOnLoadStatementEntryChannel() {
    let channel = channels.RESPONSE_LOAD_STATEMENT_ENTRY;
    ipcRenderer.on(channel, (event, statement) => {
      log.info('Response received on channel:', channel);
      log.info('Received statement:', statement);

      if (!statement) {
        return;
      }

      this.statement = statement;
      this.setCategorizationDetails(statement);

      this.categoriesMap = ipcRenderer.sendSync(channels.REQUEST_SAVED_CATEGORIZATIONS);

      let types = Array.from(this.categoriesMap.keys());
      log.info('Available types:', types);
      document.getElementById(viewElements.DATA_STATEMENT_TYPE_LIST).innerHTML = this.createOptionList(types);
    })
  }

  listenForConfirmEntryClassificationClick() {
    let channel = channels.REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION;
    this.buttonConfirmEntryClassification.addEventListener('click', () => {
      log.info('Request sent on channel:', channel);
      let categorizationDetails = this.getCategorizationDetails();
      if (!this.validDisplayedCategorizationDetails(categorizationDetails)) {
        log.info('Missing Categorization details');
        return;
      }
      log.info('Sending confirmed categorizations');
      ipcRenderer.send(channel, categorizationDetails);
    })
  }

  listenOnConfirmEntryClassificationChannel() {
    let channel = channels.RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION;
    ipcRenderer.on(channel, (event, success) => {
      log.info('Response received on channel:', channel);
      if (!success) {
        log.error('Did not successfully save categorization');
        return;
      }
      log.info('Successfully saved categorization');
      this.clearCategorizationDetails();
      this.buttonLoadStatementEntry.click();
    })
  }

  listenForExportClassificationsClick() {
    let channel = channels.REQUEST_EXPORT_CLASSIFICATIONS;
    this.buttonExportBankStatements.addEventListener('click', () => {
      log.info('Request received on channel:', channel);
      ipcRenderer.send(channel);
    })
  }

  listenOnExportClassificationsChannel() {
    let channel = channels.RESPONSE_EXPORT_CLASSIFICATIONS;
    ipcRenderer.on(channel, (event, success) => {
      log.info('Response received on channel:', channel);
      if (!success) {
        log.warn('Failed to export all statements.');
        return;
      }
      log.info('Successfully exported all statements.');
    })
  }

  listenForExportIdentifiersClick() {
    let channel = channels.REQUEST_EXPORT_IDENTIFIERS;
    this.buttonExportIdentifiers.addEventListener('click', () => {
      log.info('Request received on channel:', channel);
      ipcRenderer.send(channel);
    })
  }

  listenForLabelTypeChange() {
    this.labelTypeStatement.addEventListener('change', () => {
      log.info('Request received on type label change');
      let newType = document.getElementById(viewElements.DATA_STATEMENT_TYPE_INPUT).value;
      log.info('New type value:', newType);

      if (!newType || !this.categoriesMap.has(newType)) {
        document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_INPUT).value = null;
        document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_INPUT).value = null;
        return;
      }

      let categories = Array.from(this.categoriesMap.get(newType).keys());
      log.info('Available categories:', categories);
      document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_LIST).innerHTML = this.createOptionList(categories);
    })
  }

  listenForLabelMainCategoryChange() {
    this.labelCategoryStatement.addEventListener('change', () => {
      log.info('Request received on category label change');
      let newCategory = document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_INPUT).value;
      log.info('New category value:', newCategory);

      let currentType = document.getElementById(viewElements.DATA_STATEMENT_TYPE_INPUT).value;

      // this should always be false but added here for user experience in case something is wrong
      if (!this.categoriesMap.has(currentType)) {
        log.error("Issue with categories map. Cannot find type:", currentType);
        return;
      }

      let categoryMap = this.categoriesMap.get(currentType);
      if (!newCategory || !categoryMap.has(newCategory)) {
        document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_INPUT).value = null;
        return;
      }

      let subCategories = Array.from(categoryMap.get(newCategory).values());

      log.info('Available sub categories:', subCategories);
      document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_LIST).innerHTML = this.createOptionList(subCategories);
    })
  }

  listenOnExportIdentifiersChannel() {
    let channel = channels.RESPONSE_EXPORT_IDENTIFIERS;
    ipcRenderer.on(channel, (event, success) => {
      log.info('Response received on channel:', channel);
      if (!success) {
        log.warn('Failed to export all identifiers.');
        return;
      }
      log.info('Successfully exported all identifiers.');
    })
  }

  createOptionList(arrayOfOptions) {
    let options = '';
    for (let i = 0; i < arrayOfOptions.length; i++)
      options += '<option value="' + arrayOfOptions[i] + '" />';
    return options;
  }

  validDisplayedCategorizationDetails(categorizationDetails) {
    return (categorizationDetails.source &&
        categorizationDetails.type &&
        categorizationDetails.mainCategory &&
        categorizationDetails.subCategory);
  }

  getCategorizationDetails() {
    let categorizationDetails = {};

    categorizationDetails.transactionDate = this.statement.transactionDate;
    categorizationDetails.description = this.statement.description;
    categorizationDetails.amount = this.statement.amount;
    categorizationDetails.balance = this.statement.balance;
    categorizationDetails._id = this.statement._id;
    categorizationDetails.categorized = true;

    categorizationDetails.source = document.getElementById(viewElements.DATA_STATEMENT_SOURCE_INPUT).value;
    categorizationDetails.type = document.getElementById(viewElements.DATA_STATEMENT_TYPE_INPUT).value;
    categorizationDetails.mainCategory = document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_INPUT).value;
    categorizationDetails.subCategory = document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_INPUT).value;
    categorizationDetails.explanation = document.getElementById(viewElements.DATA_STATEMENT_EXPLANATION_INPUT).value;
    categorizationDetails.identifier = document.getElementById(viewElements.DATA_STATEMENT_IDENTIFIER_INPUT).value;

    return categorizationDetails;
  }

  clearCategorizationDetails() {
    document.getElementById(viewElements.DATA_STATEMENT_SOURCE_INPUT).value = null;
    document.getElementById(viewElements.DATA_STATEMENT_TYPE_INPUT).value = null;
    document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_INPUT).value = null;
    document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_INPUT).value = null;
    document.getElementById(viewElements.DATA_STATEMENT_EXPLANATION_INPUT).value = null;
    document.getElementById(viewElements.DATA_STATEMENT_IDENTIFIER_INPUT).value = null;
    document.getElementById(viewElements.DATA_STATEMENT_TRANSACTION_DATE).innerHTML = null;
    document.getElementById(viewElements.DATA_STATEMENT_DESCRIPTION).innerHTML = null;
    document.getElementById(viewElements.DATA_STATEMENT_AMOUNT).innerHTML = null;
    document.getElementById(viewElements.DATA_STATEMENT_BALANCE).innerHTML = null;
  }

  setCategorizationDetails(statement) {
    document.getElementById(viewElements.DATA_STATEMENT_TRANSACTION_DATE).innerHTML = statement.transactionDate;
    document.getElementById(viewElements.DATA_STATEMENT_DESCRIPTION).innerHTML = statement.description;
    document.getElementById(viewElements.DATA_STATEMENT_AMOUNT).innerHTML = statement.amount;
    document.getElementById(viewElements.DATA_STATEMENT_BALANCE).innerHTML = statement.balance;

    document.getElementById(viewElements.DATA_STATEMENT_SOURCE_INPUT).value = statement.source;
    document.getElementById(viewElements.DATA_STATEMENT_TYPE_INPUT).value = statement.type;
    document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_INPUT).value = statement.mainCategory;
    document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_INPUT).value = statement.subCategory;
  }

  allowLoadStatementEntryClick() {
    let date = document.getElementById(viewElements.DATA_STATEMENT_TRANSACTION_DATE).innerHTML;
    return !date;
  }
}

let processorRenderer = new ProcessorRenderer();
processorRenderer.start();
