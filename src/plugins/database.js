/**
 * Fastify plugin to initialize and verify the database connection using Sequelize.
 *
 * How it works:
 * - Uses `fastify-plugin` to make the plugin compatible with Fastify's ecosystem.
 * - Imports the configured Sequelize instance.
 * - When registered, it attempts to authenticate the database connection.
 * - On successful connection, logs a confirmation message.
 * - If the connection fails, logs the error and throws it to prevent the app from starting.
 *
 * Usage:
 * - Register this plugin in your Fastify app to ensure the database is connected before handling requests.
 * - For more details on Sequelize's `authenticate` method, see: https://sequelize.org/docs/v7/other-topics/usage/#connecting-to-a-database
 */
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