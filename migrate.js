const { Umzug, SequelizeStorage } = require('umzug');
const sequelize = require('./src/config/database');

const umzug = new Umzug({
  migrations: {
    glob: 'migrations/*.js', // Simplifier le pattern
    resolve: ({ name, path, context }) => {
      console.log(`📁 Loading migration: ${name} from ${path}`);
      const migration = require(path);
      return {
        name,
        up: async () => {
          console.log(`⬆️  Executing UP: ${name}`);
          return migration.up(context);
        },
        down: async () => {
          console.log(`⬇️  Executing DOWN: ${name}`);
          return migration.down(context);
        },
      };
    },
  },
  context: sequelize.queryInterface, // Utiliser queryInterface directement
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function runMigrations() {
  try {
    console.log('🔍 Starting migration process...\n');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');
    
    // Lister tous les fichiers de migration trouvés
    console.log('🔍 Looking for migration files...');
    
    // Vérifier les migrations en attente
    const pending = await umzug.pending();
    console.log(`🔄 Pending migrations: ${pending.length}`);
    pending.forEach(p => console.log(`  - ${p.name} (${p.path || 'no path'})`));
    
    if (pending.length === 0) {
      console.log('💡 No pending migrations found');
      
      // Debug: montrer ce qu'Umzug voit
      console.log('\n🔍 Debug info:');
      console.log('Working directory:', process.cwd());
      console.log('Migration glob pattern:', 'migrations/*.js');
      
      return;
    }
    
    // Exécuter les migrations
    console.log('\n🚀 Running migrations...');
    const executed = await umzug.up();
    console.log(`✅ ${executed.length} migrations executed successfully`);
    
    // Vérifier les tables après migration
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('\n📋 Tables in database:', tables.map(t => Object.values(t)[0]));
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    console.error('Error details:', err.stack);
    throw err;
  }
}

async function rollbackMigrations() {
  try {
    console.log('🔄 Rolling back last migration...');
    await sequelize.authenticate();
    const reverted = await umzug.down();
    console.log('✅ Migration rolled back:', reverted.map(m => m.name));
  } catch (err) {
    console.error('❌ Rollback failed:', err);
    throw err;
  }
}

if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'down') {
    rollbackMigrations().finally(() => sequelize.close());
  } else {
    runMigrations().finally(() => sequelize.close());
  }
} 