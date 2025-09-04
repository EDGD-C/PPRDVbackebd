const { Sequelize } = require('@sequelize/core');
const { MySqlDialect } = require('@sequelize/mysql');

const sequelize = new Sequelize({
  dialect: MySqlDialect,
  database: process.env.DB_NAME || 'c1bd1',
  user: process.env.DB_USER || 'c1bd1',
  password: process.env.DB_PASS || 'sxmiJvmFHS@N4',
  host: process.env.DB_HOST || 'vps-5c0199c2.vps.ovh.net',
  port: parseInt(process.env.DB_PORT) || 3306,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize; 