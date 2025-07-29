const fp = require('fastify-plugin');

/**
 * Plugin pour gérer les sessions utilisateur avec @fastify/session
 * 
 * @see https://github.com/fastify/session
 */
module.exports = fp(async function (fastify, opts) {
  // Enregistrer le plugin cookie (requis par session)
  await fastify.register(require('@fastify/cookie'));

  // Enregistrer le plugin session
  await fastify.register(require('@fastify/session'), {
    // Secret pour signer les cookies (minimum 32 caractères)
    secret: process.env.SESSION_SECRET || 'a_very_long_secret_key_that_is_at_least_32_chars',
    
    // Configuration du cookie
    cookie: {
      // Sécuriser le cookie (false en développement HTTP, true en production HTTPS)
      secure: process.env.NODE_ENV === 'production',
      
      // Empêcher l'accès au cookie via JavaScript côté client
      httpOnly: true,
      
      // Chemin du cookie
      path: '/',
      
      // Durée de vie du cookie (1 jour)
      maxAge: 24 * 60 * 60 * 1000,
      
      // Protection contre les attaques CSRF
      sameSite: 'lax'
    },
    
    // Ne pas sauvegarder les sessions non initialisées
    saveUninitialized: false,
    
    // Renouveler le cookie à chaque requête
    rolling: true
  });

  // Ajouter un hook pour logger les sessions (en développement uniquement)
  if (process.env.NODE_ENV !== 'production') {
    fastify.addHook('preHandler', (request, reply, done) => {
      if (request.session && request.session.sessionId) {
        request.log.info({ sessionId: request.session.sessionId }, 'Session active');
      }
      done();
    });
  }

  // Décorateur pour vérifier si l'utilisateur est connecté via la session
  fastify.decorate('isAuthenticated', async function(request, reply) {
    if (!request.session || !request.session.get('user')) {
      reply.code(401).send({ error: 'Non authentifié' });
      return false;
    }
    return true;
  });
}); 