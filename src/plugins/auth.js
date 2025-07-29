const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Register JWT plugin
  await fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'supersecret' // Use env variable in production
  });

  // Create authenticate decorator (but don't apply it globally)
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      // D'abord vérifier si l'utilisateur est authentifié via la session
      const sessionUser = request.session && request.session.get('user');
      if (sessionUser) {
        request.user = sessionUser;
        return; // Authentifié via session, on continue
      }
      
      console.log('=== AUTH DEBUG ===');
      console.log('No session auth, trying JWT');
      console.log('Authorization header:', request.headers.authorization);
      
      let token = request.headers.authorization;
      
      if (!token) {
        console.log('No authorization header found');
        console.log('================');
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      // remove the Bearer prefix
      if (token.startsWith('Bearer ')) {
        token = token.slice(7);
        console.log('Removed Bearer prefix, token:', token.substring(0, 20) + '...');
      } else {
        console.log('Token without Bearer prefix detected, using directly');
      }
      
      // Verify the token manually
      const decoded = fastify.jwt.verify(token);
      request.user = decoded;
      
      // Si on a un JWT valide mais pas de session, on peut créer une session
      if (request.session && !sessionUser) {
        request.session.set('user', decoded);
        request.session.set('loginTime', new Date().toISOString());
        request.session.set('authMethod', 'jwt');
      }
      
      console.log('JWT verified successfully');
      console.log('User data:', request.user);
      console.log('================');
    } catch (err) {
      console.log('Authentication failed:', err.message);
      console.log('================');
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
  
  // Décorateur pour vérifier si l'utilisateur est un administrateur
  fastify.decorate('requireAdmin', async function(request, reply) {
    // D'abord vérifier l'authentification
    await fastify.authenticate(request, reply);
    
    // Vérifier si l'utilisateur est un administrateur
    if (!request.user || request.user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden - Admin access required' });
    }
  });
  
  // Décorateur pour vérifier si l'utilisateur est actif
  fastify.decorate('requireActiveUser', async function(request, reply) {
    // D'abord vérifier l'authentification
    await fastify.authenticate(request, reply);
    
    // Vérifier si l'utilisateur est actif
    if (!request.user || !request.user.isActif) {
      return reply.code(403).send({ error: 'Forbidden - Account is not active' });
    }
  });
}); 