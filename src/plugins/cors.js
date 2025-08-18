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

/**
 * CORS configuration for Fastify.
 * 
 * In production, you should restrict the `origin` option to only allow trusted domains.
 * You can also restrict CORS to only allow POST requests (e.g., for authentication endpoints)
 * by using the `methods` option.
 * 
 * Example for production:
 *   - Allow only POST requests from https://your-frontend.com
 *   - Allow credentials if needed (for cookies/sessions)
 * 
 * For more options, see: https://fastify.dev/docs/latest/Reference/CORS/
 */

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/cors'), {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://axelior.fr', 'https://www.axelior.fr']
      : true, // Allow all origins in development
    methods: ['POST'], // Only allow POST requests via CORS
    credentials: true, // Allow cookies/auth headers if needed
  });
});