const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function testClientCreation() {
  try {
    console.log('🧪 Testing client creation...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Admin login successful');
    console.log('User data:', JSON.stringify(user, null, 2));
    console.log('Token:', token.substring(0, 50) + '...\n');

    // Step 2: Create a new client
    console.log('2. Creating a new client...');
    const createClientResponse = await axios.post(`${BASE_URL}/create-client`, {
      nom: 'Test Client',
      email: 'testclient@example.com',
      nomEntreprise: 'Test Enterprise',
      entrepriseId: 1,
      description: 'Test client description'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Client creation successful!');
    console.log('Response:', JSON.stringify(createClientResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testClientCreation(); 