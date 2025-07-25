const app = require('./app')

const start = async () => {
  try {
    await app.listen({ 
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost'
    })
    app.log.info('Server started successfully')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()