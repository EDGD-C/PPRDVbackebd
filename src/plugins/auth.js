const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, opts) {
  // Register JWT plugin
  await fastify.register(require('@fastify/jwt'), {
    secret: 'supersecret' // Use env variable in production
  });

  // Create authenticate decorator (but don't apply it globally)
  fastify.decorate('authenticate', async function(request, reply) {
    try {
      console.log('=== AUTH DEBUG ===');
      console.log('Authorization header:', request.headers.authorization);
      
      let token = request.headers.authorization;
      
      if (!token) {
        console.log('No authorization header found');
        console.log('================');
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      // Si le token commence par "Bearer ", on l'enlève
      if (token.startsWith('Bearer ')) {
        token = token.slice(7);
        console.log('Removed Bearer prefix, token:', token.substring(0, 20) + '...');
      } else {
        console.log('Token without Bearer prefix detected, using directly');
      }
      
      // Vérifier le token manuellement
      const decoded = fastify.jwt.verify(token);
      request.user = decoded;
      
      console.log('JWT verified successfully');
      console.log('User data:', request.user);
      console.log('================');
    } catch (err) {
      console.log('JWT verification failed:', err.message);
      console.log('================');
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}); 