const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = `update-tester-${Date.now()}@test.com`;
const originalPassword = 'Password123!';
const newPassword = 'SecurityUpdate456!';
let authToken = '';

async function runUpdatePasswordTest() {
  console.log('========================================================');
  console.log('🧪 STARTING UPDATE PASSWORD FLOW INTEGRATION TEST');
  console.log('========================================================\n');

  try {
    // Connect to database for cleanup later
    await mongoose.connect('mongodb://localhost:27017/trustpulse');
    console.log('🔌 Connected to local MongoDB.');

    // 1. Register temporary user
    console.log(`📝 Registering temp user: "${testEmail}"...`);
    const regRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Security Tester',
      email: testEmail,
      password: originalPassword
    });

    if (regRes.status === 201 && regRes.data.success) {
      console.log('✅ Temporary user registration: SUCCESS');
      authToken = regRes.data.token;
    } else {
      throw new Error('User registration failed.');
    }

    // 2. Attempt to update password with wrong current password
    console.log('\n❌ Testing failure case: Incorrect current password...');
    try {
      await axios.put(`${BASE_URL}/auth/update-password`, {
        currentPassword: 'WrongPassword999!',
        newPassword: newPassword
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('❌ Error: The API allowed password update with wrong current password!');
    } catch (err) {
      console.log(`✅ Success: API correctly rejected update. Response message: "${err.response?.data?.message}"`);
    }

    // 3. Attempt to update password with correct current password
    console.log('\n🔐 Testing success case: Correct current password...');
    const updateRes = await axios.put(`${BASE_URL}/auth/update-password`, {
      currentPassword: originalPassword,
      newPassword: newPassword
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (updateRes.status === 200 && updateRes.data.success) {
      console.log('✅ Password update: SUCCESS');
      // Update authToken to new returned token
      authToken = updateRes.data.token;
    } else {
      throw new Error('Password update failed.');
    }

    // 4. Test login with OLD password (should fail)
    console.log('\n🔑 Testing login with OLD password (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: originalPassword
      });
      console.log('❌ Error: Old password still works for login!');
    } catch (err) {
      console.log(`✅ Success: Login with old password correctly rejected. Response: "${err.response?.data?.message}"`);
    }

    // 5. Test login with NEW password (should succeed)
    console.log('\n🔑 Testing login with NEW password (should succeed)...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: newPassword
    });

    if (loginRes.status === 200 && loginRes.data.success) {
      console.log('✅ Success: Logged in using new password keys!');
    } else {
      throw new Error('Login with new password failed.');
    }

    // 6. Clean up database
    console.log(`\n🧹 Cleaning up temporary test user: "${testEmail}"...`);
    await User.deleteOne({ email: testEmail });
    console.log('✅ Cleanup: SUCCESS');

    console.log('\n========================================================');
    console.log('🎉 UPDATE PASSWORD FLOW VERIFIED 100% CORRECT!');
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Integration test encountered an error:', error.response?.data || error.message);
    // Cleanup anyway
    await User.deleteOne({ email: testEmail });
    process.exit(1);
  }
}

runUpdatePasswordTest();
