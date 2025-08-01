const clientController = require('../controllers/clientController');

module.exports = async function (fastify, opts) {
  // Common schemas
  const clientSchema = {
    type: 'object',
    properties: {
      uuid: { type: 'string', format: 'uuid' },
      nom: { type: 'string' },
      email: { type: 'string', format: 'email' },
      nomEntreprise: { type: 'string' },
      description: { type: 'string' },
      entrepriseUuid: { type: 'string', format: 'uuid' },
      isActif: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      Entreprise: {
        type: 'object',
        properties: {
          uuid: { type: 'string', format: 'uuid' },
          nom: { type: 'string' },
          siret: { type: 'string' }
        }
      }
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' }
    }
  };

  const successSchema = {
    type: 'object',
    properties: {
      message: { type: 'string' }
    }
  };

  // All routes require authentication
  fastify.addHook('onRequest', fastify.authenticate);

  // Admin only routes
  fastify.register(async function (fastify) {
    fastify.addHook('onRequest', fastify.requireAdmin);

    // Get all clients
    fastify.get('/', {
      schema: {
        tags: ['Clients'],
        summary: 'Clients list',
        description: 'Get all clients',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            includeInactive: { 
              type: 'boolean', 
              description: 'Include inactive clients',
              default: false
            }
          }
        },
        response: {
          200: {
            description: 'Clients list',
            type: 'array',
            items: clientSchema
          },
          401: {
            description: 'Non autorisé',
            ...errorSchema
          },
          403: {
            description: 'Access denied - Admin required',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const includeInactive = request.query.includeInactive === 'true';
      const clients = await clientController.getAllClients(includeInactive);
      reply.send(clients);
    });
    
    // Get client by id 
    fastify.get('/id/:uuid', {
      schema: {
        tags: ['Clients'],
        summary: 'Get client by id',
        description: 'Get a client by id',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            uuid: { type: 'string', format: 'uuid', description: 'client id' }
          },
          required: ['uuid']
        },
        response: {
          200: {
            description: 'Client found',
            ...clientSchema
          },
          404: {
            description: 'Client not found',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const client = await clientController.getClientByUuid(request.params.uuid);
      if (!client) return reply.code(404).send({ error: 'Client not found' });
      reply.send(client);
    });

    // Search clients by name
    fastify.get('/search/:term', {
      schema: {
        tags: ['Clients'],
        summary: 'Search clients by name',
        description: 'Search clients by name',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            term: { type: 'string', description: 'Search term' }
          },
          required: ['term']
        },
        response: {
          200: {
            description: 'Search results',
            type: 'array',
            items: clientSchema
          }
        }
      }
    }, async (request, reply) => {
      const clients = await clientController.searchClientsByName(request.params.term);
      reply.send(clients);
    });

    // Create a new client
    fastify.post('/', {
      schema: {
        tags: ['Clients'],
        summary: 'Create a client',
        description: 'Create a new client',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['nom', 'email'],
          properties: {
            nom: { type: 'string' },
            email: { type: 'string', format: 'email' },
            nomEntreprise: { type: 'string' },
            description: { type: 'string' },
            entrepriseId: { type: 'integer' },
            isActif: { type: 'boolean', default: true }
          }
        },
        response: {
          201: {
            description: 'Client created successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              client: clientSchema
            }
          },
          400: {
            description: 'Validation error',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const client = await clientController.createClient(request.body);
        reply.code(201).send({ 
          message: 'Client created successfully',
          client
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Update a client
    fastify.put('/:id', {
      schema: {
        tags: ['Clients'],
        summary: 'Update a client',
        description: 'Update a client',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid', description: 'Client uuid' }
          }
        },
        body: {
          type: 'object',
          properties: {
            nom: { type: 'string' },
            email: { type: 'string', format: 'email' },
            nomEntreprise: { type: 'string' },
            description: { type: 'string' },
            entrepriseId: { type: 'integer' },
            isActif: { type: 'boolean' }
          }
        },
        response: {
          200: {
            description: 'Client updated successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              client: clientSchema
            }
          },
          404: {
            description: 'Client not found',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const uuid = request.params.id;
        const updatedClient = await clientController.updateClient(uuid, request.body);
        if (!updatedClient) {
          return reply.code(404).send({ error: 'Client not found' });
        }
        reply.send({ 
          message: 'Client updated successfully',
          client: updatedClient
        });
      } catch (err) {
        // CORS errors are usually handled at the server config/middleware level, not here.
        // But for debugging, you can log the error.
        request.log.error(err);
        reply.code(400).send({ error: err.message });
      }
    });

    // Delete a client
    fastify.delete('/:id', {
      schema: {
        tags: ['Clients'],
        summary: 'Delete a client',
        description: 'Delete a client',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Client id', format: 'uuid' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Client deleted successfully',
            ...successSchema
          },
          404: {
            description: 'Client not found',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const uuid = request.params.id;
        const result = await clientController.deleteClient(uuid);
        if (!result) return reply.code(404).send({ error: 'Client not found' });
        reply.send({ message: 'Client deleted successfully' });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Deactivate a client
    fastify.patch('/:id/deactivate', {
      schema: {
        tags: ['Clients'],
        summary: 'Deactivate a client',
        description: 'Deactivate a client',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Client id', format: 'uuid' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Client deactivated successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const uuid = request.params.id;
        const client = await clientController.deactivateClient(uuid);
        if (!client) return reply.code(404).send({ error: 'Client not found' });
        reply.send({ 
          message: 'Client deactivated successfully',
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Activate a client
    fastify.patch('/:id/activate', {
      schema: {
        tags: ['Clients'],
        summary: 'Activate a client',
        description: 'Activate a client',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Client id', format: 'uuid' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Client activated successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const client = await clientController.activateClient(request.params.id);
        if (!client) return reply.code(404).send({ error: 'Client non trouvé' });
        reply.send({ 
          message: 'Client activated successfully',
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });
  });
};