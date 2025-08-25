const { Sequelize } = require('@sequelize/core');
const { MySqlDialect } = require('@sequelize/mysql');

const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: 'c1bd1', // Change to your DB name
  user: 'c1dbu',      // Change to your MySQL user
  password: 'sxmiJvmFHS@N4',      // Change to your MySQL password
  host: 'vps-5c0199c2.vps.ovh.net',
  port: 3306,
  logging: false,
});

module.exports = sequelize; 

