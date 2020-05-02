// const {Sequelize, Model, DataTypes } = require('sequelize');
//
// const sequelize = new Sequelize('database', 'pniehaus', null, {dialect: 'postgres'});
//
// let attributes = {
//     date: DataTypes.DATE,
//     description: DataTypes.STRING,
//     debit: DataTypes.DOUBLE,
//     credit: DataTypes.DOUBLE,
//     balance: DataTypes.DOUBLE,
// };
//
// let options = {sequelize, modelName: 'bankStatement' };
//
// class BankStatement extends Model {}
// BankStatement.init(attributes, options);
//
// console.info("Creating the table");
// BankStatement.sync({ force: true });
