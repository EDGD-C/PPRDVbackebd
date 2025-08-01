const AuthController = require('../controllers/authController');
const User = require('../models/User');

module.exports = async function (fastify, opts) {
  // Schemas
  const userSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      uuid: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['admin', 'client'] },
      isActif: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  };

  const adminSchema = {
    type: 'object',
    properties: {
      ...userSchema.properties,
      username: { type: 'string' }
    }
  };

  const clientSchema = {
    type: 'object',
    properties: {
      ...userSchema.properties,
      nom: { type: 'string' },
      nomEntreprise: { type: 'string' },
      entrepriseId: { type: 'integer' },
      isFirstLogin: { type: 'boolean' }
    }
  };

  const errorSchema = {
    type: 'object',
    properties: {
      error: { type: 'string' }
    }
  };

  // Unified Login (works for both admin and client)
  fastify.post('/login', {
    schema: {
      tags: ['Authentication'],
      summary: 'Unified login',
      description: 'Authenticate admin or client with email and password',
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
            needsPasswordChange: { type: 'boolean' }
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
      const user = await AuthController.login({ email, password });
      const userData = await AuthController.prepareUserData(user);
      
      // Create JWT token
      const token = fastify.jwt.sign(userData);
      
      // Store user data in session
      request.session.set('user', userData);
      request.session.set('loginTime', new Date().toISOString());
      
      reply.send({ 
        message: 'Login successful',
        token
      });
    } catch (err) {
      reply.code(401).send({ error: err.message });
    }
  });

  // Register new admin (admin only)
  // fastify.post('/register-admin', {
  //   schema: {
  //     tags: ['Authentication'],
  //     summary: 'Register new admin',
  //     description: 'Register a new admin user (requires admin privileges)',
  //     body: {
  //       type: 'object',
  //       required: ['username', 'email', 'password'],
  //       properties: {
  //         username: { type: 'string', minLength: 3, maxLength: 50 },
  //         email: { type: 'string', format: 'email' },
  //         password: { type: 'string', minLength: 6 } 
  //       }
  //     },
  //     response: {
  //       201: {
  //         description: 'Admin created successfully',
  //         type: 'object',
  //         properties: {
  //           message: { type: 'string' },
  //           admin: adminSchema
  //         }
  //       },
  //       400: {
  //         description: 'Validation error',
  //         ...errorSchema
  //       },
  //       401: {
  //         description: 'Unauthorized - Admin access required',
  //         ...errorSchema
  //       }
  //     }
  //   }
  // }, async (request, reply) => {
  //   // Check if user is authenticated and is admin
  //   const userData = request.session.get('user');
  //   if (!userData || userData.role !== 'admin') {
  //     return reply.code(401).send({ error: 'Admin access required' });
  //   }

  //   const { username, email, password } = request.body;
    
  //   try {
  //     const admin = await AuthController.registerAdmin({
  //       username,
  //       email,
  //       password,
  //       currentAdminId: userData.id
  //     });

  //     const adminData = await AuthController.prepareUserData(admin);
      
  //     reply.code(201).send({ 
  //       message: 'Admin created successfully',
  //       admin: adminData
  //     });
  //   } catch (err) {
  //     if (err.message.includes('Admin privileges required')) {
  //       reply.code(401).send({ error: err.message });
  //     } else {
  //       reply.code(400).send({ error: err.message });
  //     }
  //   }
  // });

  // Create new client (admin only)
  fastify.post('/create-client', {
    schema: {
      tags: ['Authentication'],
      summary: 'Create new client',
      description: 'Create a new client user (requires admin privileges)',
      body: {
        type: 'object',
        required: ['nom', 'email'],
        properties: {
          nom: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          nomEntreprise: { type: 'string' },
          entrepriseId: { type: 'integer' },
          description: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'Client created successfully',
          type: 'object',
          properties: {
            message: { type: 'string' },
            client: clientSchema,
            defaultPassword: { type: 'string' }
          }
        },
        400: {
          description: 'Validation error',
          ...errorSchema
        },
        401: {
          description: 'Unauthorized - Admin access required',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    // Check if user is authenticated and is admin
    const userData = request.session.get('user');
    if (!userData || userData.role !== 'admin') {
      return reply.code(401).send({ error: 'Admin access required' });
    }

    const { nom, email, nomEntreprise, entrepriseId, description } = request.body;
    
    try {
      const client = await AuthController.createClient({
        nom,
        email,
        nomEntreprise,
        entrepriseId,
        description,
        adminId: userData.id
      });

      const clientData = await AuthController.prepareUserData(client);
      
      reply.code(201).send({ 
        message: 'Client created successfully',
        client: clientData,
        defaultPassword: AuthController.DEFAULT_CLIENT_PASSWORD
      });
    } catch (err) {
      if (err.message.includes('Admin privileges required')) {
        reply.code(401).send({ error: err.message });
      } else {
        reply.code(400).send({ error: err.message });
      }
    }
  });

  // Change password (works for both admin and client)
  fastify.post('/change-password', {
    schema: {
      tags: ['Authentication'],
      summary: 'Change password',
      description: 'Change user password (requires authentication)',
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 }
        }
      },
      response: {
        200: {
          description: 'Password changed successfully',
          type: 'object',
          properties: {
            message: { type: 'string' },
            user: {
              oneOf: [adminSchema, clientSchema]
            }
          }
        },
        400: {
          description: 'Validation error',
          ...errorSchema
        },
        401: {
          description: 'Unauthorized or invalid current password',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    // Check if user is authenticated
    const userData = request.session.get('user');
    if (!userData) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    const { currentPassword, newPassword } = request.body;
    
    if (!currentPassword || !newPassword) {
      return reply.code(400).send({ error: 'Current password and new password are required' });
    }

    try {
      const user = await AuthController.changePassword({
        userId: userData.id,
        currentPassword,
        newPassword
      });

      const updatedUserData = await AuthController.prepareUserData(user);
      
      // Update session with new user data
      request.session.set('user', updatedUserData);
      
      reply.send({ 
        message: 'Password changed successfully',
        user: updatedUserData
      });
    } catch (err) {
      if (err.message.includes('Current password is incorrect')) {
        reply.code(401).send({ error: err.message });
      } else {
        reply.code(400).send({ error: err.message });
      }
    }
  });

  // Get current session info
  fastify.get('/session', {
    schema: {
      tags: ['Authentication'],
      summary: 'Get session info',
      description: 'Get information about the current session',
      response: {
        200: {
          description: 'Session information',
          type: 'object',
          properties: {
            isAuthenticated: { type: 'boolean' },
            user: {
              oneOf: [adminSchema, clientSchema]
            },
            sessionId: { type: 'string' },
            loginTime: { type: 'string', format: 'date-time' },
            needsPasswordChange: { type: 'boolean' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const user = request.session.get('user');
    const loginTime = request.session.get('loginTime');
    
    if (!user) {
      return reply.send({
        isAuthenticated: false,
        user: null,
        sessionId: request.session.sessionId,
        loginTime: null,
        needsPasswordChange: false
      });
    }

    reply.send({
      isAuthenticated: true,
      user: user,
      sessionId: request.session.sessionId,
      loginTime: loginTime || null,
      needsPasswordChange: user.role === 'client' && user.isFirstLogin
    });
  });

  // Logout
  fastify.post('/logout', {
    schema: {
      tags: ['Authentication'],
      summary: 'Logout',
      description: 'Logout the current user session',
      response: {
        200: {
          description: 'Logout successful',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    // Clear session
    request.session.delete();
    
    reply.send({ 
      message: 'Logged out successfully'
    });
  });

  // Admin: Reset client password to default
  fastify.post('/admin/reset-client-password/:clientId', {
    schema: {
      tags: ['Authentication'],
      summary: 'Reset client password to default (Admin only)',
      description: 'Reset a client password to the default password',
      params: {
        type: 'object',
        properties: {
          clientId: { type: 'integer' }
        }
      },
      response: {
        200: {
          description: 'Password reset successful',
          type: 'object',
          properties: {
            message: { type: 'string' },
            defaultPassword: { type: 'string' }
          }
        },
        400: {
          description: 'Validation error',
          ...errorSchema
        },
        401: {
          description: 'Unauthorized - Admin access required',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    // Check if user is authenticated and is admin
    const userData = request.session.get('user');
    if (!userData || userData.role !== 'admin') {
      return reply.code(401).send({ error: 'Admin access required' });
    }

    const { clientId } = request.params;
    
    try {
      await AuthController.resetClientPassword({ 
        clientId, 
        adminId: userData.id 
      });
      
      reply.send({ 
        message: 'Client password reset successfully',
        defaultPassword: AuthController.DEFAULT_CLIENT_PASSWORD
      });
    } catch (err) {
      reply.code(400).send({ error: err.message });
    }
  });

  // Get user profile
  fastify.get('/profile', {
    schema: {
      tags: ['Authentication'],
      summary: 'Get user profile',
      description: 'Get current user profile information',
      response: {
        200: {
          description: 'User profile',
          type: 'object',
          properties: {
            user: {
              oneOf: [adminSchema, clientSchema]
            }
          }
        },
        401: {
          description: 'Unauthorized',
          ...errorSchema
        }
      }
    }
  }, async (request, reply) => {
    const userData = request.session.get('user');
    if (!userData) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    try {
      const user = await AuthController.getUserProfile(userData.id);
      const profileData = await AuthController.prepareUserData(user);
      
      reply.send({ user: profileData });
    } catch (err) {
      reply.code(400).send({ error: err.message });
    }
  });
}; 