const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/cors'), {
    origin: true // Allow all origins in development
  });
}); 