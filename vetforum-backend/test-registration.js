const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api/vetforumindia/v1';

// Test 1: Non-veterinarian registration (JSON)
async function testNonVetRegistration() {
  try {
    const response = await axios.post(`${API_BASE}/authentication/register`, {
      firstName: "test",
      lastName: "user",
      email: `nonvet${Date.now()}@test.com`,
      mobile: 9876543210,
      state: "Karnataka",
      password: "test12",
      confirmPassword: "test12",
      isVeterinarian: false
    });
    
    console.log('✅ Non-vet registration:', response.status, response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Non-vet registration failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Veterinarian registration with new fields (Form-data)
async function testVetRegistration() {
  try {
    const form = new FormData();
    form.append('firstName', 'test');
    form.append('lastName', 'vet');
    form.append('email', `vet${Date.now()}@test.com`);
    form.append('mobile', '9876543211');
    form.append('state', 'Maharashtra');
    form.append('password', 'test12');
    form.append('confirmPassword', 'test12');
    form.append('isVeterinarian', 'true');
    form.append('veterinarianType', 'Graduated');
    form.append('veterinarianState', 'Maharashtra');
    form.append('vetRegNo', '12345');
    form.append('qualification', 'BVSc');
    
    // Create a dummy file for testing
    const testFile = Buffer.from('test document content');
    form.append('documents', testFile, 'test-document.pdf');
    
    const response = await axios.post(`${API_BASE}/authentication/register`, form, {
      headers: form.getHeaders()
    });
    
    console.log('✅ Vet registration:', response.status, response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Vet registration failed:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Registration API...\n');
  
  const test1 = await testNonVetRegistration();
  const test2 = await testVetRegistration();
  
  console.log('\n📊 Test Results:');
  console.log(`Non-vet registration: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Vet registration: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
}

if (require.main === module) {
  runTests();
}

module.exports = { testNonVetRegistration, testVetRegistration };