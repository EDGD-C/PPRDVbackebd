const authController = require('../controllers/authController');
const User = require('../models/User');

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

  // Register standard
  fastify.post('/register', {
    schema: {
      tags: ['Authentication'],
      summary: 'Enregistrer un nouvel utilisateur',
      description: 'Créer un compte utilisateur standard avec le rôle "user"',
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
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
    const { username, email, password } = request.body;
    
    if (!username || !email || !password) {
      return reply.code(400).send({ error: 'Tous les champs sont obligatoires' });
    }

    try {
      const user = await authController.register({ username, email, password });
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
      console.log('Erreur register:', err);
      
      // Gestion spécifique des erreurs Sequelize
      if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0].path;
        if (field === 'email') {
          return reply.code(400).send({ error: 'Cet email est déjà utilisé' });
        } else if (field === 'username') {
          return reply.code(400).send({ error: 'Ce nom d\'utilisateur est déjà pris' });
        }
        return reply.code(400).send({ error: 'Ces données sont déjà utilisées' });
      }
      
      if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map(e => e.message).join(', ');
        return reply.code(400).send({ error: `Erreur de validation: ${messages}` });
      }
      
      reply.code(400).send({ error: err.message || 'Erreur lors de la création du compte' });
    }
  });

  // Créer le premier administrateur (seulement si aucun admin n'existe)
  fastify.post('/create-first-admin', {
    schema: {
      tags: ['Authentication'],
      summary: 'Créer le premier administrateur',
      description: 'Créer le premier compte administrateur du système (disponible uniquement si aucun admin n\'existe)',
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      },
      response: {
        201: {
          description: 'Premier administrateur créé avec succès',
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: userSchema
          }
        },
        400: {
          description: 'Erreur - Administrateur déjà existant ou validation échouée',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    const { username, email, password } = request.body;
    
    if (!username || !email || !password) {
      return reply.code(400).send({ error: 'Tous les champs sont obligatoires' });
    }

    try {
      // Vérifier s'il existe déjà des administrateurs
      const existingAdmins = await User.findAdmins();
      if (existingAdmins.length > 0) {
        return reply.code(400).send({ error: 'Des administrateurs existent déjà dans le système' });
      }

      const user = await authController.register({ username, email, password, role: 'admin' });
      reply.code(201).send({ 
        message: 'Premier administrateur créé avec succès',
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

  // Login
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Se connecter',
      description: 'Authentifier un utilisateur et obtenir un token JWT',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Connexion réussie',
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: userSchema
          }
        },
        401: {
          description: 'Identifiants invalides ou compte inactif',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;
    
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email et mot de passe sont obligatoires' });
    }

    try {
      const result = await authController.login({ email, password });
      const token = fastify.jwt.sign({ 
        id: result.user.id, 
        uuid: result.user.uuid,
        username: result.user.username,
        email: result.user.email,
        role: result.user.role,
        isActif: result.user.isActif
      });
      
      reply.send({ 
        message: 'Connexion réussie',
        token,
        user: {
          id: result.user.id,
          uuid: result.user.uuid,
          username: result.user.username,
          email: result.user.email,
          role: result.user.role,
          isActif: result.user.isActif
        }
      });
    } catch (err) {
      reply.code(401).send({ error: err.message });
    }
  });

  // Vérifier le statut du système (combien d'admins existent)
  fastify.get('/system-status', {
    schema: {
      tags: ['Authentication'],
      summary: 'Statut du système',
      description: 'Obtenir des informations sur l\'état du système (nombre d\'administrateurs)',
      response: {
        200: {
          description: 'Informations système',
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalAdmins: { type: 'integer' },
            activeUsers: { type: 'integer' },
            needsFirstAdmin: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const [totalUsers, admins, activeUsers] = await Promise.all([
        User.count(),
        User.findAdmins(),
        User.findActiveUsers()
      ]);

      reply.send({
        totalUsers,
        totalAdmins: admins.length,
        activeUsers: activeUsers.length,
        needsFirstAdmin: admins.length === 0
      });
    } catch (err) {
      reply.code(500).send({ error: err.message });
    }
  });
}; 