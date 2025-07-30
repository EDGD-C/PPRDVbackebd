const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Configuration Swagger
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'API Gestion Utilisateurs',
        description: 'API complète pour la gestion des utilisateurs avec authentification JWT, rôles et statuts',
        version: '1.0.0',
        contact: {
          name: 'Support API',
          email: 'support@example.com'
        }
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Entrez le token JWT avec le préfixe Bearer. Exemple: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      },
      security: [
        {
          Bearer: []
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: 'Endpoints pour l\'authentification et l\'enregistrement'
        },
        // {
        //   name: 'Users',
        //   description: 'Gestion des utilisateurs (routes protégées)'
        // },
        {
          name: 'Admin',
          description: 'Administration des utilisateurs (admin uniquement)'
        },
        {
          name: 'Profile',
          description: 'Gestion du profil utilisateur'
        }
      ]
    }
  });

  // Configuration Swagger UI
  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 1
    },
    uiHooks: {
      onRequest: function (request, reply, next) { next() },
      preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
  });

  fastify.log.info('📚 Swagger documentation disponible sur: http://localhost:3000/documentation');
}); 