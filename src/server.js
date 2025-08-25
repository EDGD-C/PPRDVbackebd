require('dotenv').config();
const app = require('./app')

const start = async () => {
  try {
    await app.listen({ 
      port: process.env.PORT,
      host: process.env.HOST
    })
    app.log.info('Server started successfully')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()