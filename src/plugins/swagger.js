require('dotenv').config();
const fp = require('fastify-plugin');

module.exports = fp(async function (fastify) {
  const isProd = process.env.NODE_ENV === 'production';
  const API_HOST = process.env.API_HOST || 'localhost';
  const API_PORT = process.env.PORT || 3000;
  const API_SCHEME = isProd ? 'https' : 'http';

  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'API Gestion Utilisateurs',
        description: 'API complète pour la gestion des utilisateurs',
        version: '1.0.0'
      },
      host: isProd ? API_HOST : `${API_HOST}:${API_PORT}`,  // ex: api.axelior.fr en prod
      schemes: [API_SCHEME],                                 // https en prod
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      },
      security: [{ Bearer: [] }],
      tags: [
        { name: 'Authentication', description: 'Auth & inscription' },
        { name: 'Admin', description: 'Administration' },
        { name: 'Profile', description: 'Profil' }
      ]
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    staticCSP: true
  });

  fastify.log.info(`📚 Swagger: ${API_SCHEME}://${isProd ? API_HOST : API_HOST + ':' + API_PORT}/documentation`);
});
