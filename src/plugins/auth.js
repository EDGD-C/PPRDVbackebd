const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Register JWT plugin
  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET 
  });

  // Create authenticate decorator (but don't apply it globally)
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      // First check if the user is authenticated via the session
      const sessionUser = request.session && request.session.get('user');
      if (sessionUser) {
        request.user = sessionUser;
        return; // Authenticated via session, continue
      }
      
      let token = request.headers.authorization;
      
      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      // remove the Bearer prefix
      if (token.startsWith('Bearer ')) {
        token = token.slice(7);
      }
      
      // Verify the token manually
      const decoded = fastify.jwt.verify(token);
      request.user = decoded;
      
      // If we have a valid JWT but no session, we can create a session
      if (request.session && !sessionUser) {
        request.session.set('user', decoded);
        request.session.set('loginTime', new Date().toISOString());
        request.session.set('authMethod', 'jwt');
      }
      
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
  
  // Decorator to check if the user is an admin
  fastify.decorate('requireAdmin', async function(request, reply) {
    // First check the authentication
    await fastify.authenticate(request, reply);
    
    // Check if the user is an admin
    if (!request.user || request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden - Admin access required' });
    }
  });
  
  // Decorator to check if the user is active
  fastify.decorate('requireActiveUser', async function(request, reply) {
    // First check the authentication
    await fastify.authenticate(request, reply);
    
    // Check if the user is active
    if (!request.user || !request.user.isActif) {
      return reply.code(403).send({ error: 'Forbidden - Account is not active' });
    }
  });
}); 