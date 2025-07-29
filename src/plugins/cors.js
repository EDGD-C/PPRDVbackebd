/**
 * This file defines a Fastify plugin to enable Cross-Origin Resource Sharing (CORS) for the application.
 * 
 * How it works:
 * - It uses the `fastify-plugin` utility to make this plugin compatible with Fastify's plugin system.
 * - Inside the exported function, it registers the official `@fastify/cors` plugin.
 * - The `origin: true` option allows requests from any origin (i.e., it enables CORS for all domains).
 *   This is useful in development environments where you may want to access the API from different frontends or tools.
 *   In production, you should restrict the `origin` option to trusted domains for better security.
 * 
 * Usage:
 * - This plugin should be loaded in your Fastify app to enable CORS globally.
 * - For more configuration options, see the latest documentation: https://fastify.dev/docs/latest/Reference/CORS/
 */

const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/cors'), {
    origin: true // Allow all origins in development
  });
}); 