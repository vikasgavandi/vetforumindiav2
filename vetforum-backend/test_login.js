const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:4000/api/vetforumindia/v1/authentication/login', {
      email: 'expert_verified@vetforumindia.com',
      password: 'password123'
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('FAILED:', error.response.status, error.response.data);
    } else {
      console.log('ERROR:', error.message);
    }
  }
}

testLogin();
