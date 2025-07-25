const userController = require('../controllers/userController');
const { checkActiveUser, requireAdmin } = require('../middleware/roleMiddleware');

module.exports = async function (fastify, opts) {
  // Schémas communs
  const userSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      uuid: { type: 'string', format: 'uuid' },
      username: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['user', 'admin'] },
      isActif: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
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

  // Toutes les routes nécessitent une authentification de base
  fastify.addHook('onRequest', fastify.authenticate);

  // Routes utilisateur standard - accessible à tous les utilisateurs authentifiés et actifs
  fastify.register(async function (fastify) {
    fastify.addHook('onRequest', checkActiveUser);

    // Obtenir le profil de l'utilisateur connecté
    fastify.get('/profile', {
      schema: {
        tags: ['Profile'],
        summary: 'Mon profil',
        description: 'Obtenir les informations de mon profil utilisateur',
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: 'Profil utilisateur',
            ...userSchema
          },
          401: {
            description: 'Non autorisé',
            ...errorSchema
          },
          404: {
            description: 'Utilisateur non trouvé',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const user = await userController.getUserById(request.user.id);
      reply.send(user);
    });

    // Mettre à jour son propre profil
    fastify.put('/profile', {
      schema: {
        tags: ['Profile'],
        summary: 'Modifier mon profil',
        description: 'Mettre à jour mes informations personnelles',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        },
        response: {
          200: {
            description: 'Profil mis à jour avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: userSchema
            }
          },
          400: {
            description: 'Erreur de validation',
            ...errorSchema
          },
          401: {
            description: 'Non autorisé',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const { username, email, password } = request.body;
      const updateData = {};
      
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      
      const user = await userController.updateUser(request.user.id, updateData);
      if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      
      reply.send({ 
        message: 'Profil mis à jour avec succès',
        user: {
          id: user.id,
          uuid: user.uuid,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    });
  });

  // Routes administrateur uniquement
  fastify.register(async function (fastify) {
    fastify.addHook('onRequest', requireAdmin);

    // Obtenir tous les utilisateurs (y compris inactifs pour les admins)
    fastify.get('/', {
      schema: {
        tags: ['Admin'],
        summary: 'Liste des utilisateurs',
        description: 'Obtenir la liste de tous les utilisateurs (admin uniquement)',
        security: [{ Bearer: [] }],
        querystring: {
          type: 'object',
          properties: {
            includeInactive: { 
              type: 'boolean', 
              description: 'Inclure les utilisateurs inactifs',
              default: false
            }
          }
        },
        response: {
          200: {
            description: 'Liste des utilisateurs',
            type: 'array',
            items: userSchema
          },
          401: {
            description: 'Non autorisé',
            ...errorSchema
          },
          403: {
            description: 'Accès interdit - Admin requis',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const includeInactive = request.query.includeInactive === 'true';
      const users = await userController.getAllUsers(includeInactive);
      reply.send(users);
    });

    // Obtenir un utilisateur par ID
    fastify.get('/:id', {
      schema: {
        tags: ['Admin'],
        summary: 'Utilisateur par ID',
        description: 'Obtenir un utilisateur spécifique par son ID (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Utilisateur trouvé',
            ...userSchema
          },
          404: {
            description: 'Utilisateur non trouvé',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const user = await userController.getUserById(request.params.id);
      if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      reply.send(user);
    });

    // Obtenir un utilisateur par UUID
    fastify.get('/uuid/:uuid', {
      schema: {
        tags: ['Admin'],
        summary: 'Utilisateur par UUID',
        description: 'Obtenir un utilisateur spécifique par son UUID (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            uuid: { type: 'string', format: 'uuid', description: 'UUID de l\'utilisateur' }
          },
          required: ['uuid']
        },
        response: {
          200: {
            description: 'Utilisateur trouvé',
            ...userSchema
          },
          404: {
            description: 'Utilisateur non trouvé',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const user = await userController.getUserByUuid(request.params.uuid);
      if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      reply.send(user);
    });

    // Créer un nouvel utilisateur (admin peut spécifier le rôle)
    fastify.post('/', {
      schema: {
        tags: ['Admin'],
        summary: 'Créer un utilisateur',
        description: 'Créer un nouvel utilisateur (admin uniquement)',
        security: [{ Bearer: [] }],
        body: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
            isActif: { type: 'boolean', default: true }
          }

        },
        response: {
          201: {
            description: 'Utilisateur créé avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: userSchema
            }
          },
          400: {
            description: 'Erreur de validation',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      const { username, email, password, role, isActif } = request.body;
      if (!username || !email || !password) {
        return reply.code(400).send({ error: 'Champs obligatoires manquants' });
      }
      
      try {
        const user = await userController.createUser({ 
          username, 
          email, 
          password, 
          role: role || 'user',
          isActif: isActif !== undefined ? isActif : true
        });
        
        reply.code(201).send({ 
          message: 'Utilisateur créé avec succès',
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            role: user.role,
            isActif: user.isActif
          }
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Mettre à jour un utilisateur
    fastify.put('/:id', {
      schema: {
        tags: ['Admin'],
        summary: 'Modifier un utilisateur',
        description: 'Mettre à jour les informations d\'un utilisateur (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        body: {
          type: 'object',
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['user', 'admin'] },
            isActif: { type: 'boolean' }
          },

        },
        response: {
          200: {
            description: 'Utilisateur mis à jour avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: userSchema
            }
          },
          404: {
            description: 'Utilisateur non trouvé',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const user = await userController.updateUser(request.params.id, request.body);
        if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({ 
          message: 'Utilisateur mis à jour avec succès',
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            email: user.email,
            role: user.role,
            isActif: user.isActif
          }
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Supprimer un utilisateur
    fastify.delete('/:id', {
      schema: {
        tags: ['Admin'],
        summary: 'Supprimer un utilisateur',
        description: 'Supprimer définitivement un utilisateur (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Utilisateur supprimé avec succès',
            ...successSchema
          },
          404: {
            description: 'Utilisateur non trouvé',
            ...errorSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const result = await userController.deleteUser(request.params.id);
        if (!result) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({ message: 'Utilisateur supprimé avec succès' });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Désactiver un utilisateur
    fastify.patch('/:id/deactivate', {
      schema: {
        tags: ['Admin'],
        summary: 'Désactiver un utilisateur',
        description: 'Désactiver un compte utilisateur (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Utilisateur désactivé avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  uuid: { type: 'string' },
                  username: { type: 'string' },
                  isActif: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const user = await userController.deactivateUser(request.params.id);
        if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({ 
          message: 'Utilisateur désactivé avec succès',
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            isActif: user.isActif
          }
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Activer un utilisateur
    fastify.patch('/:id/activate', {
      schema: {
        tags: ['Admin'],
        summary: 'Activer un utilisateur',
        description: 'Activer un compte utilisateur (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Utilisateur activé avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  uuid: { type: 'string' },
                  username: { type: 'string' },
                  isActif: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const user = await userController.activateUser(request.params.id);
        if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({ 
          message: 'Utilisateur activé avec succès',
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            isActif: user.isActif
          }
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Promouvoir au rôle admin
    fastify.patch('/:id/promote', {
      schema: {
        tags: ['Admin'],
        summary: 'Promouvoir en administrateur',
        description: 'Promouvoir un utilisateur au rôle administrateur (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Utilisateur promu administrateur avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  uuid: { type: 'string' },
                  username: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const user = await userController.promoteToAdmin(request.params.id);
        if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({ 
          message: 'Utilisateur promu administrateur avec succès',
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            role: user.role
          }
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Rétrograder du rôle admin
    fastify.patch('/:id/demote', {
      schema: {
        tags: ['Admin'],
        summary: 'Rétrograder un administrateur',
        description: 'Rétrograder un administrateur au rôle utilisateur (admin uniquement)',
        security: [{ Bearer: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'ID de l\'utilisateur' }
          },
          required: ['id']
        },
        response: {
          200: {
            description: 'Utilisateur rétrogradé au rôle utilisateur avec succès',
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  uuid: { type: 'string' },
                  username: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }, async (request, reply) => {
      try {
        const user = await userController.demoteFromAdmin(request.params.id);
        if (!user) return reply.code(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({ 
          message: 'Utilisateur rétrogradé au rôle utilisateur avec succès',
          user: {
            id: user.id,
            uuid: user.uuid,
            username: user.username,
            role: user.role
          }
        });
      } catch (err) {
        reply.code(400).send({ error: err.message });
      }
    });

    // Obtenir tous les administrateurs
    fastify.get('/role/admins', {
      schema: {
        tags: ['Admin'],
        summary: 'Liste des administrateurs',
        description: 'Obtenir la liste de tous les administrateurs (admin uniquement)',
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: 'Liste des administrateurs',
            type: 'array',
            items: userSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const admins = await userController.getAdmins();
        reply.send(admins);
      } catch (err) {
        reply.code(500).send({ error: err.message });
      }
    });

    // Obtenir tous les utilisateurs actifs
    fastify.get('/status/active', {
      schema: {
        tags: ['Admin'],
        summary: 'Utilisateurs actifs',
        description: 'Obtenir la liste de tous les utilisateurs actifs (admin uniquement)',
        security: [{ Bearer: [] }],
        response: {
          200: {
            description: 'Liste des utilisateurs actifs',
            type: 'array',
            items: userSchema
          }
        }
      }
    }, async (request, reply) => {
      try {
        const activeUsers = await userController.getActiveUsers();
        reply.send(activeUsers);
      } catch (err) {
        reply.code(500).send({ error: err.message });
      }
    });
  });
}; 