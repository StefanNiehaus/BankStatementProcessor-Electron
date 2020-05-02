const RxDB = require('rxdb');
let { adaptor, pluginName, databaseName } = require('./constants');

class BankStatementsDAO {

}

RxDB.plugin(require(pluginName));

const database = RxDB.create({name: databaseName, adapter: adaptor});
