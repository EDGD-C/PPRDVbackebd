const sequelize = require('./src/config/database');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Entreprise = require('./src/models/Entreprise');
const Client = require('./src/models/Client');

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Force drop and recreate all tables
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created successfully');
    
    // Create default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActif: true,
      isFirstLogin: false
    });
    console.log('✅ Admin user created:', admin.email);
    
    // Create demo enterprises
    console.log('🏢 Creating demo enterprises...');
    const entreprises = await Entreprise.bulkCreate([
      {
        nom: 'Entreprise Demo 1',
        description: 'Une entreprise de démonstration',
        siret: '12345678901234'
      },
      {
        nom: 'Entreprise Demo 2',
        description: 'Une autre entreprise de démonstration',
        siret: '98765432109876'
      }
    ]);
    console.log('✅ Demo enterprises created');
    
    // Create demo clients
    console.log('👥 Creating demo clients...');
    const defaultClientPassword = await bcrypt.hash('client123', 10);
    const clientUsers = await User.bulkCreate([
      {
        username: 'client1@example.com',
        email: 'client1@example.com',
        password: defaultClientPassword,
        role: 'client',
        isActif: true,
        isFirstLogin: true
      },
      {
        username: 'client2@example.com',
        email: 'client2@example.com',
        password: defaultClientPassword,
        role: 'client',
        isActif: true,
        isFirstLogin: true
      }
    ]);
    
    await Client.bulkCreate([
      {
        uuid: clientUsers[0].uuid, // Use same UUID as user
        userId: clientUsers[0].id,
        nom: 'Client 1',
        nomEntreprise: 'Entreprise Client 1',
        entrepriseId: entreprises[0].id,
        description: 'Un client de démonstration'
      },
      {
        uuid: clientUsers[1].uuid, // Use same UUID as user
        userId: clientUsers[1].id,
        nom: 'Client 2',
        nomEntreprise: 'Entreprise Client 2',
        entrepriseId: entreprises[1].id,
        description: 'Un autre client de démonstration'
      }
    ]);
    console.log('✅ Demo clients created');
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n📋 Default credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Client 1: client1@example.com / client123');
    console.log('Client 2: client2@example.com / client123');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the reset
resetDatabase(); 