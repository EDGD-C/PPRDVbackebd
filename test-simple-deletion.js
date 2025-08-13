const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testSimpleDeletion() {
  try {
    console.log('🧪 Testing simple client deletion...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Admin login successful');
    
    // Step 2: Create a test client
    console.log('\n2. Creating a test client...');
    const createResponse = await axios.post(`${BASE_URL}/api/auth/create-client`, {
      nom: 'Client Test Delete',
      email: 'delete-test@example.com',
      nomEntreprise: 'Test Delete Enterprise',
      entrepriseId: 1,
      description: 'Client for deletion test'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const clientData = createResponse.data.client;
    const clientUuid = clientData.uuid;
    console.log('✅ Test client created with UUID:', clientUuid);
    console.log('📋 Client data:', JSON.stringify(clientData, null, 2));
    
    // Step 3: Delete the client
    console.log('\n3. Deleting the client using UUID:', clientUuid);
    const deleteResponse = await axios.delete(`${BASE_URL}/api/clients/${clientUuid}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Delete request successful:', deleteResponse.data.message);
    
    // Step 4: Try to login with the deleted client
    console.log('\n4. Trying to login with deleted client...');
    try {
      const loginDeletedResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'delete-test@example.com',
        password: 'client123'
      });
      console.log('❌ ERROR: Deleted client can still login!');
    } catch (loginError) {
      if (loginError.response?.status === 401) {
        console.log('✅ Deleted client cannot login anymore (expected)');
      } else {
        console.log('❓ Unexpected error:', loginError.response?.data);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testSimpleDeletion();