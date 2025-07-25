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

// Register core plugins first
fastify.register(require('./plugins/database'))
fastify.register(require('./plugins/cors'))

// Register content parsing (required for request.body)
fastify.register(require('@fastify/formbody'))

// Register authentication plugins
fastify.register(require('./plugins/auth')) // JWT & authenticate
fastify.register(require('./plugins/swagger')) // Swagger documentation

// Register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' })
fastify.register(require('./routes/users'), { prefix: '/api/users' })

// Add a simple test route (no auth required)
fastify.get('/test', async (request, reply) => {
  return { message: 'Server is working', timestamp: new Date().toISOString() };
});

module.exports = fastify