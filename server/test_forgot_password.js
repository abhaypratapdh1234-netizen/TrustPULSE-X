const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const testEmail = 'abhaypratap7777@gmail.com';
const newPassword = 'UpdatedPassword123!';

async function runTest() {
  console.log('🧪 Starting Forgot & Reset Password API Flow Integration Test...');
  try {
    // 0. Register user first to ensure they exist
    console.log(`📝 Pre-registering user: "${testEmail}"...`);
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Abhay Pratap',
        email: testEmail,
        password: 'Password123!'
      });
      console.log('✅ Pre-registration: SUCCESS');
    } catch (regErr) {
      console.log('ℹ️ Pre-registration: Email already registered or skipped.');
    }

    // 1. Request password reset
    console.log(`📤 Sending password reset request for email: "${testEmail}"...`);
    const forgotRes = await axios.post(`${BASE_URL}/auth/forgot-password`, {
      email: testEmail
    });
    
    if (forgotRes.status === 200 && forgotRes.data.success) {
      console.log('✅ Forgot Password Request: SUCCESS');
      console.log(`   └─ Message: "${forgotRes.data.message}"`);
      
      const resetUrl = forgotRes.data.resetUrl;
      if (resetUrl) {
        console.log(`   └─ Generated Reset URL: "${resetUrl}"`);
        
        // Extract token
        const tokenMatch = resetUrl.match(/\/reset-password\/([^/]+)/);
        if (tokenMatch && tokenMatch[1]) {
          const token = tokenMatch[1];
          console.log(`🔑 Extracted Reset Token: "${token}"`);
          
          // 2. Perform password reset
          console.log('📥 Submitting new password reset...');
          const resetRes = await axios.post(`${BASE_URL}/auth/reset-password/${token}`, {
            password: newPassword
          });
          
          if (resetRes.status === 200 && resetRes.data.success) {
            console.log('✅ Reset Password: SUCCESS');
            console.log(`   └─ Returned New JWT Token: "${resetRes.data.token.substring(0, 20)}..."`);
            console.log('🎉 Forgot & Reset Password API Flow completed with 100% success!');
          } else {
            console.log('❌ Reset Password: FAILED', resetRes.data);
          }
        } else {
          console.log('❌ Failed to extract token from Reset URL.');
        }
      } else {
        console.log('❌ No resetUrl returned in development response.');
      }
    } else {
      console.log('❌ Forgot Password Request: FAILED', forgotRes.data);
    }
  } catch (err) {
    console.error('❌ Integration Test Failed with error:', err.response?.data || err.message);
  }
}

runTest();
