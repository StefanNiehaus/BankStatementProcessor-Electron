// Request channels: renderer to main
const REQUEST_SELECT_STATEMENT = 'open-file-dialog';
const REQUEST_LOAD_STATEMENT = 'load-file';
const REQUEST_LOAD_STATEMENT_ENTRY = 'channel-request-load-statement-entry';
const REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION = 'channel-request-save-entry-classification';
const REQUEST_CONFIRM_CLASSIFICATIONS = 'channel-request-confirm-classifications';
const REQUEST_EXPORT_CLASSIFICATIONS = 'channel-request-export-classifications';

// Response channels: main to renderer
const RESPONSE_SELECT_STATEMENT = 'selected-file';
const RESPONSE_LOAD_STATEMENT_ENTRY = 'channel-response-load-statement-entry';
const RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION = 'channel-response-save-entry-classification';
const RESPONSE_CONFIRM_CLASSIFICATIONS = 'channel-response-confirm-classifications';
const RESPONSE_EXPORT_CLASSIFICATIONS = 'channel-response-export-classifications';

module.exports = {
    REQUEST_SELECT_STATEMENT,
    REQUEST_LOAD_STATEMENT,
    REQUEST_LOAD_STATEMENT_ENTRY,
    REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION,
    REQUEST_CONFIRM_CLASSIFICATIONS,
    REQUEST_EXPORT_CLASSIFICATIONS,

    RESPONSE_SELECT_STATEMENT,
    RESPONSE_LOAD_STATEMENT_ENTRY,
    RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION,
    RESPONSE_CONFIRM_CLASSIFICATIONS,
    RESPONSE_EXPORT_CLASSIFICATIONS
};
