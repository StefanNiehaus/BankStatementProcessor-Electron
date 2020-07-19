// Request channels: renderer to main
const REQUEST_SELECT_STATEMENT_FILE = 'channel-request-select-bank-statement-file';
const REQUEST_SELECT_IDENTIFIERS_FILE = 'channel-request-select-identifiers-file';

const REQUEST_LOAD_STATEMENT = 'channel-request-load-bank-statement-file';
const REQUEST_LOAD_IDENTIFIERS = 'channel-request-load-identifiers-file';

const REQUEST_START_AUTO_CLASSIFICATION = 'channel-request-start-auto-classification';
const REQUEST_LOAD_STATEMENT_ENTRY = 'channel-request-load-statement-entry';
const REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION = 'channel-request-save-entry-classification';
const REQUEST_EXPORT_CLASSIFICATIONS = 'channel-request-export-classifications';
const REQUEST_EXPORT_IDENTIFIERS = 'channel-request-export-identifiers';

const REQUEST_SAVED_CATEGORIZATIONS = 'channel-get-categorizations';
const REQUEST_DELETE_CATEGORIZATIONS = 'channel-delete-categorizations';
const REQUEST_DELETE_STATEMENTS = 'channel-delete-statements';

// Response channels: main to renderer
const RESPONSE_SELECT_STATEMENT = 'channel-response-select-bank-statement-file';
const RESPONSE_LOAD_IDENTIFIERS = 'channel-response-select-identifiers-file';

const RESPONSE_START_AUTO_CLASSIFICATION = 'channel-response-start-auto-classification';
const RESPONSE_LOAD_STATEMENT_ENTRY = 'channel-response-load-statement-entry';
const RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION = 'channel-response-save-entry-classification';
const RESPONSE_EXPORT_CLASSIFICATIONS = 'channel-response-export-classifications';
const RESPONSE_EXPORT_IDENTIFIERS = 'channel-response-export-identifiers';

module.exports = {
    REQUEST_SELECT_STATEMENT_FILE,
    REQUEST_SELECT_IDENTIFIERS_FILE,

    REQUEST_LOAD_STATEMENT,
    REQUEST_LOAD_IDENTIFIERS,

    REQUEST_START_AUTO_CLASSIFICATION,
    REQUEST_LOAD_STATEMENT_ENTRY,
    REQUEST_SAVE_STATEMENT_ENTRY_CLASSIFICATION,
    REQUEST_EXPORT_CLASSIFICATIONS,
    REQUEST_EXPORT_IDENTIFIERS,

    REQUEST_SAVED_CATEGORIZATIONS,
    REQUEST_DELETE_CATEGORIZATIONS,
    REQUEST_DELETE_STATEMENTS,

    RESPONSE_SELECT_STATEMENT,
    RESPONSE_LOAD_STATEMENT_ENTRY,
    RESPONSE_SAVE_STATEMENT_ENTRY_CLASSIFICATION,
    RESPONSE_EXPORT_CLASSIFICATIONS,
    RESPONSE_LOAD_IDENTIFIERS,
    RESPONSE_START_AUTO_CLASSIFICATION,
    RESPONSE_EXPORT_IDENTIFIERS
};
