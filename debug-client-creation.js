const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Client = require('./src/models/Client');

async function debugClientCreation() {
  try {
    console.log('🔍 Debugging client creation...\n');
    
    // Check all users
    const allUsers = await User.findAll();
    console.log('👥 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (UUID: ${user.uuid}, Role: ${user.role})`);
    });
    
    console.log('\n');
    
    // Check all clients
    const allClients = await Client.findAll();
    console.log('🏢 All clients in database:');
    allClients.forEach(client => {
      console.log(`- ${client.nom} (UUID: ${client.uuid}, UserID: ${client.userId})`);
    });
    
    // Find the specific client we're looking for
    const testClient = await User.findOne({ where: { email: 'quick@test.com' } });
    if (testClient) {
      console.log('\n🔍 Found test user:', {
        id: testClient.id,
        uuid: testClient.uuid,
        email: testClient.email,
        role: testClient.role
      });
      
      const testClientProfile = await Client.findOne({ where: { userId: testClient.id } });
      if (testClientProfile) {
        console.log('🔍 Found test client profile:', {
          id: testClientProfile.id,
          uuid: testClientProfile.uuid,
          nom: testClientProfile.nom,
          userId: testClientProfile.userId
        });
      } else {
        console.log('❌ No client profile found for this user');
      }
    } else {
      console.log('\n❌ Test user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

debugClientCreation();