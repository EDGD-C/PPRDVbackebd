const fp = require('fastify-plugin');
const sequelize = require('../config/database');

module.exports = fp(async function (fastify, opts) {
  try {
    await sequelize.authenticate();
    fastify.log.info('Database connected');
  } catch (err) {
    fastify.log.error('Unable to connect to the database:', err);
    throw err;
  }
}); 