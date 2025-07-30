const { spawn } = require('child_process');
const sequelize = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la connexion à la base de données...');
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.log('💡 Assurez-vous que :');
    console.log('   1. MySQL est démarré');
    console.log('   2. La base de données "pprdv" existe');
    console.log('   3. Les variables d\'environnement sont correctement configurées');
    console.log('   4. Exécutez "node init-db.js" pour initialiser la base de données');
    return false;
  }
}

async function startServer() {
  const dbOk = await checkDatabase();
  
  if (!dbOk) {
    console.log('\n🚀 Pour initialiser la base de données, exécutez :');
    console.log('   node init-db.js');
    process.exit(1);
  }

  console.log('\n🚀 Démarrage du serveur...');
  console.log('📖 Documentation disponible sur : http://localhost:3000/documentation');
  console.log('🔐 Compte admin par défaut : admin@example.com / admin123');
  console.log('⏹️  Appuyez sur Ctrl+C pour arrêter le serveur\n');

  // Démarrer le serveur
  const server = spawn('node', ['src/server.js'], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  });

  server.on('close', (code) => {
    console.log(`\n👋 Serveur arrêté avec le code : ${code}`);
    process.exit(code);
  });

  // Gérer l'arrêt propre du serveur
  process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Arrêt du serveur...');
    server.kill('SIGTERM');
  });
}

// Démarrer l'application
startServer(); 