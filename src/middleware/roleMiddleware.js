/**
 * There is no CORS middleware in this file.
 * 
 * To configure CORS for the clients API (or any Fastify API), you should use the official Fastify CORS plugin.
 * 
 * Example (in your main server file, e.g., app.js or server.js):
 * 
 * const fastify = require('fastify')();
 * const fastifyCors = require('@fastify/cors');
 * 
 * // Register CORS with your desired options
 * fastify.register(fastifyCors, {
 *   origin: true, // or specify allowed origins
 *   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
 *   credentials: true
 * });
 * 
 * // Then register your routes, e.g.:
 * fastify.register(require('./routes/clients'));
 * 
 * For more details, see: https://fastify.dev/docs/latest/Reference/CORS/
 * 
 * This file (roleMiddleware.js) only contains user/role authorization middleware.
 */

const User = require('../models/User');

// Middleware to check if the user is active
const checkActiveUser = async (request, reply) => {
  try {
    const userId = request.user.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActif) {
      return reply.code(403).send({ 
        error: 'User account is disabled' 
      });
    }
    
    // Add the complete user information to the request
    request.userDetails = user;
  } catch (err) {
    return reply.code(500).send({ 
      error: 'Error checking user status' 
    });
  }
};

// Middleware to check if the user is an admin
const requireAdmin = async (request, reply) => {
  try {
    const userId = request.user.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.isActif) {
      return reply.code(403).send({ 
        error: 'User account is disabled' 
      });
    }
    
    if (user.role !== 'admin') {
      return reply.code(403).send({ 
        error: 'Access authorized to administrators only' 
      });
    }
    
    // Add the complete user information to the request
    request.userDetails = user;
  } catch (err) {
    return reply.code(500).send({ 
      error: 'Error checking permissions' 
    });
  }
};

// Middleware to check a specific role
const requireRole = (role) => {
  return async (request, reply) => {
    try {
      const userId = request.user.id;
      const user = await User.findByPk(userId);
      
      if (!user || !user.isActif) {
        return reply.code(403).send({ 
          error: 'User account is disabled' 
        });
      }
      
      if (user.role !== role) {
        return reply.code(403).send({ 
          error: `Access authorized to the role ${role} only` 
        });
      }
      
      request.userDetails = user;
    } catch (err) {
      return reply.code(500).send({ 
        error: 'Error checking permissions' 
      });
    }
  };
};

module.exports = {
  checkActiveUser,
  requireAdmin,
  requireRole,
}; 