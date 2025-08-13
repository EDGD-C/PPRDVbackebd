const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';

async function debugLogin() {
  try {
    console.log('🔍 Debugging login...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('✅ Login response received');
    console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
    
    const { token, user } = loginResponse.data;
    
    if (!token) {
      console.error('❌ No token received');
      return;
    }
    
    if (!user) {
      console.error('❌ No user data received');
      return;
    }
    
    console.log('\n2. Testing token...');
    
    // Test the token by making a request to /session
    const sessionResponse = await axios.get(`${BASE_URL}/session`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Session response:', JSON.stringify(sessionResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the debug
debugLogin(); 