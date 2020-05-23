
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
        }
    },
    required: ['transactionDate', 'description', 'amount', 'balance']
};

module.exports = {
    bankStatementSchema
};
