const axios = require('axios');

async function createSuperAdmin() {
  try {
    const response = await axios.post('http://localhost:5004/api/users/superAdmin', {
      email: 'admin@PRIMA.com',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      designation: 'Super Administrator'
    });
    
    console.log('✅ Super Admin created successfully!');
    console.log('Response:', response.data);
    console.log('Token:', response.data.token);
    
    // Test login with the created admin
    const loginResponse = await axios.post('http://localhost:5004/api/users/login', {
      email: 'admin@PRIMA.com',
      password: 'Admin@123' // You'll need to check the actual password from the email or logs
    });
    
    console.log('✅ Login test successful!');
    console.log('Login response:', loginResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

createSuperAdmin();