const fastify = require('fastify')({ 
  logger: true,
  bodyLimit: 1048576, // 1MB
  trustProxy: true
})

// Add JSON parser support
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  try {
    const json = JSON.parse(body)
    done(null, json)
  } catch (err) {
    err.statusCode = 400
    done(err, undefined)
  }
})

// Register CORS plugin
fastify.register(require('@fastify/cors'), {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
})

// Register core plugins first
fastify.register(require('./plugins/database'))
//fastify.register(require('./plugins/cors'))

// Register session plugin (before auth)
fastify.register(require('./plugins/session'))

// Register content parsing (required for request.body)
fastify.register(require('@fastify/formbody'))

// Register authentication plugins
fastify.register(require('./plugins/auth')) // JWT & authenticate
fastify.register(require('./plugins/swagger')) // Swagger documentation

// Register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' })
fastify.register(require('./routes/users'), { prefix: '/api/users' })
fastify.register(require('./routes/entreprises'), { prefix: '/api/entreprises' })
fastify.register(require('./routes/clients'), { prefix: '/api/clients' })

// Add a simple test route (no auth required)
fastify.get('/test', async (request, reply) => {
  return { message: 'Server is working', timestamp: new Date().toISOString() };
});

// Add a session test route
fastify.get('/session-test', async (request, reply) => {
  // Incrémenter un compteur dans la session
  const count = request.session.get('count') || 0;
  request.session.set('count', count + 1);
  request.session.set('lastVisit', new Date().toISOString());
  
  return { 
    message: 'Session test',
    sessionId: request.session.sessionId,
    visits: count + 1,
    lastVisit: request.session.get('lastVisit')
  };
});

module.exports = fastify