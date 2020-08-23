const moment = require('moment');
const settings = require('electron-settings');
const settingKeys = require('../../constants/settings');

const ORIGINAL_DATE_FORMATS = ['YYYY/MM/DD'];
const DATE_FORMAT = 'YYYY-MM-DD';

function formatStatement(originalStatement, config) {
    let date = moment(originalStatement[config.columnDateIndex], ORIGINAL_DATE_FORMATS);
    originalStatement[config.columnDateIndex] = date.format(DATE_FORMAT);
    return originalStatement;
}

function constructIdentifierDocument(data, config) {
    return {
        type: data[config.typeIndex],
        mainCategory: data[config.categoryIndex],
        subCategory: data[config.subCategoryIndex],
        identifier: data[config.identifierIndex]
    }
}

function constructDocument(statement, config) {
    return {
        transactionDate: statement[config.columnDateIndex],
        description: statement[config.columnDescriptionIndex],
        amount: parseFloat(statement[config.columnAmountIndex]),
        balance: parseFloat(statement[config.columnBalanceIndex]),
        categorized: false,
        source: config.source,
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
