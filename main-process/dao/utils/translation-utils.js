const moment = require('moment');
const settings = require('electron-settings');
const settingKeys = require('../../../constants/settings');

const DATE_FORMAT = 'YYYY-MM-DD';

function formatStatement(originalStatement) {
    let date = moment(originalStatement[settings.get(settingKeys.COLUMN_TRANSACTION_DATE)]);
    originalStatement[settings.get(settingKeys.COLUMN_TRANSACTION_DATE)] = date.format(DATE_FORMAT);
    return originalStatement;

}

function constructDocument(statement) {
    return {
        transactionDate: statement[settings.get(settingKeys.COLUMN_TRANSACTION_DATE)],
        description: statement[settings.get(settingKeys.COLUMN_DESCRIPTION)],
        amount: parseFloat(statement[settings.get(settingKeys.COLUMN_AMOUNT)]),
        balance: parseFloat(statement[settings.get(settingKeys.COLUMN_BALANCE)]),
        categorized: false
    }
}

module.exports = {
    formatStatement,
    constructDocument
};
