const { Sequelize } = require('@sequelize/core');
const { MySqlDialect } = require('@sequelize/mysql');

const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: 'pprdv', // Change to your DB name
  user: 'root',      // Change to your MySQL user
  password: '',      // Change to your MySQL password
  host: 'localhost',
  port: 3306,
  logging: false,
});

module.exports = sequelize; 