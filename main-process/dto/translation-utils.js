const moment = require('moment');
const settings = require('electron-settings');
const settingKeys = require('../../constants/settings');

const ORIGINAL_DATE_FORMATS = ['YYYY/MM/DD'];
const DATE_FORMAT = 'YYYY-MM-DD';

function formatStatement(originalStatement) {
    let date = moment(originalStatement[settings.get(settingKeys.COLUMN_TRANSACTION_DATE)], ORIGINAL_DATE_FORMATS);
    originalStatement[settings.get(settingKeys.COLUMN_TRANSACTION_DATE)] = date.format(DATE_FORMAT);
    return originalStatement;
}

function constructIdentifierDocument(data, config) {
    return {
        source: data[config.sourceIndex],
        type: data[config.typeIndex],
        mainCategory: data[config.categoryIndex],
        subCategory: data[config.subCategoryIndex],
        identifier: data[config.identifierIndex]
    }
}

function constructDocument(statement) {
    return {
        transactionDate: statement[settings.get(settingKeys.COLUMN_TRANSACTION_DATE)],
        description: statement[settings.get(settingKeys.COLUMN_DESCRIPTION)],
        amount: parseFloat(statement[settings.get(settingKeys.COLUMN_AMOUNT)]),
        balance: parseFloat(statement[settings.get(settingKeys.COLUMN_BALANCE)]),
        categorized: false,
        source: null,
        type: null,
        mainCategory: null,
        subCategory: null,
        explanation: null,
        identifier: null
    }
}

function constructCategoryIdentifierDocument(statement) {
    return {
        source: statement.source,
        type: statement.type,
        mainCategory: statement.mainCategory,
        subCategory: statement.subCategory,
        identifier: statement.identifier
    }
}


module.exports = {
    formatStatement,
    constructDocument,
    constructCategoryIdentifierDocument,
    constructIdentifierDocument
};
