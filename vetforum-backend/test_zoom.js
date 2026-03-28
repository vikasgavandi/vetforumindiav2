require('dotenv').config();
const zoomService = require('./src/utils/zoomService');

async function testZoom() {
  console.log('Testing Zoom OAuth Integration...');
  console.log('Account ID:', process.env.ZOOM_ACCOUNT_ID ? 'Present' : 'Missing');
  console.log('Client ID:', process.env.ZOOM_CLIENT_ID ? 'Present' : 'Missing');
  console.log('Client Secret:', process.env.ZOOM_CLIENT_SECRET ? 'Present' : 'Missing');

  try {
    const token = await zoomService.getAccessToken();
    if (token && token !== 'mock_token') {
      console.log('✅ Success! Successfully acquired access token from Zoom.');
    } else if (token === 'mock_token') {
      console.log('⚠️ Warning: Received mock token. Check if NODE_ENV is development or credentials are wrong.');
    } else {
      console.log('❌ Failure: No token returned.');
    }
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

testZoom();
