
// See https://json-schema.org
const bankStatementSchema = {
    version: 0,
    title: 'Bank Statement Schema',
    description: 'Describes a simple bank statement',
    type: 'object',
    properties: {
        transactionDate: {
            type: 'string',
            format: 'date'
        },
        description: {
            type: 'string'
        },
        amount: {
            type: 'number'
        },
        balance: {
            type: 'number'
        },
        categorized: {
            type: 'boolean'
        },
        source: {
            type: ['string', 'null']
        },
        type: {
            type: ['string', 'null']
        },
        mainCategory: {
            type: ['string', 'null']
        },
        subCategory: {
            type: ['string', 'null']
        },
        explanation: {
            type: ['string', 'null']
        },
        identifier: {
            type: ['string', 'null']
        }
    },
    required: ['transactionDate', 'description', 'amount', 'balance']
};

const categorizationsSchema = {
    version: 0,
    title: 'Bank Statement Schema',
    description: 'Describes a simple bank statement',
    type: 'object',
    properties: {
        source: {
            type: 'string'
        },
        type: {
            type: 'string'
        },
        mainCategory: {
            type: 'string'
        },
        subCategory: {
            type: 'string'
        },
        identifier: {
            type: 'string'
        }
    },
    required: ['source', 'type', 'mainCategory', 'subCategory', 'identifier']
};

module.exports = {
    bankStatementSchema,
    categorizationsSchema
};
