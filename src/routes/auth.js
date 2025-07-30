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
      summary: 'Register a new user',
      description: 'Create a new user with the role "user"',
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
          description: 'User created successfully',
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: userSchema
          }
        },
        400: {
          description: 'Validation error',
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
        message: 'User created successfully',
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
      console.log('Register error:', err);
      
      // specific Sequelize error handling
      if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0].path;
        if (field === 'email') {
          return reply.code(400).send({ error: 'This email is already in use' });
        } else if (field === 'username') {
          return reply.code(400).send({ error: 'This username is already taken' });
        }
        return reply.code(400).send({ error: 'These data are already in use' });
      }
      
      if (err.name === 'SequelizeValidationError') {
        const messages = err.errors.map(e => e.message).join(', ');
        return reply.code(400).send({ error: `Validation error: ${messages}` });
      }
      
      reply.code(400).send({ error: err.message || 'Error creating account' });
    }
  });

  // Login
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Login',
      description: 'Authenticate a user and get a JWT token + session',
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
          description: 'Login successful',
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: userSchema
          }
        },
        401: {
          description: 'Invalid credentials or inactive account',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;
    
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const result = await authController.login({ email, password });
      const userData = authController.prepareUserData(result.user);
      
      // Créer le token JWT
      const token = fastify.jwt.sign(userData);
      
      // Stocker les données utilisateur dans la session
      request.session.set('user', userData);
      request.session.set('loginTime', new Date().toISOString());
      
      reply.send({ 
        message: 'Login successful',
        token,
        user: userData
      });
    } catch (err) {
      reply.code(401).send({ error: err.message });
    }
  });

  // Get current session info
  // fastify.get('/session', {
  //   schema: {
  //     tags: ['Authentication'],
  //     summary: 'Get session info',
  //     description: 'Get information about the current session',
  //     response: {
  //       200: {
  //         description: 'Session information',
  //         type: 'object',
  //         properties: {
  //           isAuthenticated: { type: 'boolean' },
  //           user: userSchema,
  //           sessionId: { type: 'string' },
  //           loginTime: { type: 'string', format: 'date-time' }
  //         }
  //       }
  //     }
  //   }
  // }, async (request, reply) => {
  //   const user = request.session.get('user');
  //   const loginTime = request.session.get('loginTime');
    
  //   reply.send({
  //     isAuthenticated: !!user,
  //     user: user || null,
  //     sessionId: request.session.sessionId,
  //     loginTime: loginTime || null
  //   });
  // });

  // check the system status (how many admins exist)
  fastify.get('/system-status', {
    schema: {
      tags: ['Authentication'],
      summary: 'System status',
      description: 'Get information about the system status (number of admins)',
      response: {
        200: {
          description: 'System information',
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