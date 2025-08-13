const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function testClientDeletion() {
  try {
    console.log('🧪 Testing client deletion...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Admin login successful');
    
    // Step 2: Create a test client
    console.log('\n2. Creating a test client...');
    const createResponse = await axios.post(`${BASE_URL}/create-client`, {
      nom: 'Client Test',
      email: 'test-deletion@example.com',
      nomEntreprise: 'Test Enterprise',
      entrepriseId: 1,
      description: 'Client for deletion test'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const { client } = createResponse.data;
    console.log('✅ Test client created with UUID:', client.uuid);
    
    // Step 3: Verify client exists in both tables
    console.log('\n3. Verifying client exists...');
    const clientsResponse = await axios.get('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const testClient = clientsResponse.data.find ? clientsResponse.data.find(c => c.email === 'test-deletion@example.com') : null;
    console.log('✅ Client found in clients table with UUID:', testClient?.uuid);
    
    // Check users table
    const usersResponse = await axios.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const testUser = usersResponse.data.users.find(u => u.email === 'test-deletion@example.com');
    console.log('✅ User found in users table with UUID:', testUser?.uuid);
    
    if (testClient?.uuid === testUser?.uuid) {
      console.log('✅ UUIDs match between client and user tables!');
    } else {
      console.log('❌ UUIDs do not match!');
    }
    
    // Step 4: Delete the client
    console.log('\n4. Deleting the client...');
    const deleteResponse = await axios.delete(`http://localhost:3000/api/clients/${testClient.uuid}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Delete request successful:', deleteResponse.data.message);
    
    // Step 5: Verify client is deleted from both tables
    console.log('\n5. Verifying deletion...');
    
    // Check clients table
    const clientsAfterDelete = await axios.get('http://localhost:3000/api/clients', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const clientStillExists = clientsAfterDelete.data.clients.find(c => c.email === 'test-deletion@example.com');
    
    // Check users table
    const usersAfterDelete = await axios.get('http://localhost:3000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userStillExists = usersAfterDelete.data.users.find(u => u.email === 'test-deletion@example.com');
    
    if (!clientStillExists && !userStillExists) {
      console.log('✅ Client successfully deleted from both tables!');
    } else {
      console.log('❌ Deletion incomplete:');
      console.log('- Client exists:', !!clientStillExists);
      console.log('- User exists:', !!userStillExists);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the test
testClientDeletion();