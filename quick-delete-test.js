const axios = require('axios');

async function quickTest() {
  try {
    // 1. Login
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = login.data.token;
    console.log('✅ Login OK');
    
    // 2. Create client
    const create = await axios.post('http://localhost:3000/api/auth/create-client', {
      nom: 'Quick Test',
      email: 'quick@test.com',
      nomEntreprise: 'Quick Corp'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const clientUuid = create.data.client.uuid;
    console.log('✅ Client created:', clientUuid);
    
    // 3. Delete client
    console.log('🗑️ Deleting client...');
    const deleteReq = await axios.delete(`http://localhost:3000/api/clients/${clientUuid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Delete response:', deleteReq.data);
    
    // 4. Try to login with deleted client
    try {
      const loginDeleted = await axios.post('http://localhost:3000/api/auth/login', {
        email: 'quick@test.com',
        password: 'client123'
      });
      console.log('❌ ERROR: Can still login!');
    } catch (err) {
      console.log('✅ Cannot login anymore (good!)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

quickTest();