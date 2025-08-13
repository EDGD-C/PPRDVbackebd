const axios = require('axios');

async function testExistingClient() {
  try {
    // 1. Login as admin
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = login.data.token;
    console.log('✅ Admin login OK');
    
    // 2. Try to login as existing client
    console.log('\n🔐 Testing client login...');
    const clientLogin = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'client1@example.com',
      password: 'client123'
    });
    
    console.log('✅ Client login successful');
    const clientData = clientLogin.data.user;
    console.log('Client UUID:', clientData.uuid);
    
    // 3. Try to delete existing client 
    console.log('\n🗑️ Testing deletion of existing client...');
    const deleteReq = await axios.delete(`http://localhost:3000/api/clients/${clientData.uuid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Delete response:', deleteReq.data);
    
    // 4. Verify client can no longer login
    console.log('\n🔐 Verifying client cannot login...');
    try {
      await axios.post('http://localhost:3000/api/auth/login', {
        email: 'client1@example.com',
        password: 'client123'
      });
      console.log('❌ ERROR: Client can still login!');
    } catch (loginErr) {
      if (loginErr.response?.status === 401) {
        console.log('✅ Client cannot login anymore - deletion successful!');
      } else {
        console.log('❓ Unexpected error:', loginErr.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testExistingClient();