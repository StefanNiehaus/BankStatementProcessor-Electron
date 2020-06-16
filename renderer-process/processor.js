const {ipcRenderer} = require("electron");

const channels = require("../constants/channels");
const viewElements = require("./constants/view-elements");

class ProcessorRenderer {
  buttonLoadStatementEntry = document.getElementById(viewElements.BUTTON_LOAD_STATEMENT_ENTRY);
  buttonConfirmEntryClassification = document.getElementById(viewElements.BUTTON_CONFIRM_ENTRY_CLASSIFICATION);
  buttonConfirmAllClassifications = document.getElementById(viewElements.BUTTON_CONFIRM_ALL_CLASSIFICATIONS);
  buttonExport = document.getElementById(viewElements.BUTTON_EXPORT);

  start() {
    // Channel Listeners
    this.listenOnLoadStatementEntryChannel();
    this.listenOnConfirmEntryClassificationChannel();
    this.listenOnConfirmAllClassificationsChannel();
    this.listenOnExportClassificationsChannel();

    // Event Listeners
    this.listenForLoadStatementEntryClick();
    this.listenForConfirmEntryClassificationClick();
    this.listenForConfirmAllClassificationsClick();
    this.listenForExportClassificationsClick();

    this.statement = null;
  }

  listenForLoadStatementEntryClick() {
    let channel = channels.REQUEST_LOAD_STATEMENT_ENTRY;
    this.buttonLoadStatementEntry.addEventListener('click', () => {
      if (!this.allowLoadStatementEntryClick()) {
        console.info('Request not sent on channel:', channel);
        return;
      }
      console.info('Request sent on channel:', channel);
      ipcRenderer.send(channel);
    });
  }

  listenOnLoadStatementEntryChannel() {
    let channel = channels.RESPONSE_LOAD_STATEMENT_ENTRY;
    ipcRenderer.on(channel, (event, statement) => {
      console.info('Response received on channel:', channel);
      console.info('Received statement:', statement);

      if (!statement) { return; }

      this.statement = statement;

      this.setCategorizationDetails(statement);

      // document.getElementById(viewElements.DATA_STATEMENT_SOURCE_LIST).innerHTML = options;
    })
  }

  listenForConfirmEntryClassificationClick() {
    let channel = channels.REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION;
    this.buttonConfirmEntryClassification.addEventListener('click', () => {
      console.info('Request sent on channel:', channel);
      let categorizationDetails = this.getCategorizationDetails();
      if (!this.validDisplayedCategorizationDetails(categorizationDetails)) {
        console.info('Missing Categorization details');
        return;
      }
      console.info('Sending confirmed categorizations');
      ipcRenderer.send(channel, categorizationDetails);
    })
  }

  listenOnConfirmEntryClassificationChannel() {
    let channel = channels.RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION;
    ipcRenderer.on(channel, (event, success) => {
      console.info('Response received on channel:', channel);
      if (!success) {
        console.error('Did not successfully save categorization');
        return;
      }
      console.info('Successfully saved categorization');
      this.clearCategorizationDetails();
      this.buttonLoadStatementEntry.click();
    })
  }

  listenForConfirmAllClassificationsClick() {
    let channel = channels.REQUEST_CONFIRM_CLASSIFICATIONS;
    this.buttonConfirmAllClassifications.addEventListener('click', () => {
      console.info('Request received on channel:', channel);
      ipcRenderer.send(channel);
    })
  }

  listenOnConfirmAllClassificationsChannel() {
    let channel = channels.RESPONSE_CONFIRM_CLASSIFICATIONS;
    ipcRenderer.on(channel, (event, success) => {
      console.info('Response received on channel:', channel);
      if (!success) {
        console.error('Failed to save all categorizations.');
        return;
      }
      console.info('Successfully saved all categorizations');
    })
  }

  listenForExportClassificationsClick() {
    let channel = channels.REQUEST_EXPORT_CLASSIFICATIONS;
    this.buttonExport.addEventListener('click', () => {
      console.info('Request received on channel:', channel);
      ipcRenderer.send(channel);
    })
  }

  listenOnExportClassificationsChannel() {
    let channel = channels.RESPONSE_EXPORT_CLASSIFICATIONS;
    ipcRenderer.on(channel, (event, success) => {
      console.info('Response received on channel:', channel);
      if (!success) {
        console.error('Failed to export all files.');
        return;
      }
      console.info('Successfully exported all files.');
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
    categorizationDetails.mainCategory = document.getElementById(viewElements.DATA_STATEMENT_CATEGORY_INPUT).value;
    categorizationDetails.subCategory = document.getElementById(viewElements.DATA_STATEMENT_SUB_CATEGORY_INPUT).value;
    categorizationDetails.explanation = document.getElementById(viewElements.DATA_STATEMENT_EXPLANATION_INPUT).value;
    categorizationDetails.identifier = document.getElementById(viewElements.DATA_STATEMENT_IDENTIFIER_INPUT).value;

    return categorizationDetails;
  }

  clearCategorizationDetails() {
    document.getElementById(viewElements.DATA_STATEMENT_SOURCE_INPUT).value = null;
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
