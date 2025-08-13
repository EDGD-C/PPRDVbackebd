const axios = require('axios');

async function testDetailedError() {
  try {
    // 1. Login
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = login.data.token;
    console.log('✅ Login OK');
    
    // 2. Create client with full logging
    console.log('🔄 Creating client...');
    const create = await axios.post('http://localhost:3000/api/auth/create-client', {
      nom: 'Detail Test',
      email: 'detail@test.com',
      nomEntreprise: 'Detail Corp',
      entrepriseId: 1,
      description: 'Test with details'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const clientData = create.data.client;
    const clientUuid = clientData.uuid;
    console.log('✅ Client created successfully');
    console.log('Client UUID:', clientUuid);
    
    // 3. Now test deletion
    console.log('\n🗑️ Testing deletion...');
    const deleteReq = await axios.delete(`http://localhost:3000/api/clients/${clientUuid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Delete response:', deleteReq.data);
    
    // 4. Try to login with deleted client
    console.log('\n🔐 Testing login after deletion...');
    try {
      const loginDeleted = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'detail@test.com',
        password: 'client123'
      });
      console.log('❌ ERROR: Can still login after deletion!');
    } catch (loginErr) {
      if (loginErr.response?.status === 401) {
        console.log('✅ Cannot login anymore (good!)');
      } else {
        console.log('❓ Unexpected login error:', loginErr.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Detailed Error:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      if (error.response.headers) {
        console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      }
    }
    if (error.request) {
      console.error('Request was made but no response received');
    }
  }
}

testDetailedError();