/**
 * Test script for Yellow Bank Banking Agent API
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Yellow Bank Banking Agent API\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: Intent Recognition
    console.log('2️⃣ Testing Intent Recognition...');
    const intentResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to check my loan details' })
    });
    const intentData = await intentResponse.json();
    console.log('✅ Intent Response:', intentData.response.message);
    console.log('   Session ID:', intentData.sessionId);
    console.log('   State:', intentData.state.state);
    console.log('');

    const sessionId = intentData.sessionId;

    // Test 3: Phone Number Collection
    console.log('3️⃣ Testing Phone Number Collection...');
    const phoneResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '9876543210' })
    });
    const phoneData = await phoneResponse.json();
    console.log('✅ Phone Response:', phoneData.response.message);
    console.log('   State:', phoneData.state.state);
    console.log('');

    // Test 4: DOB Collection
    console.log('4️⃣ Testing DOB Collection...');
    const dobResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '15/06/1990' })
    });
    const dobData = await dobResponse.json();
    console.log('✅ DOB Response:', dobData.response.message);
    console.log('   State:', dobData.state.state);
    if (dobData.response.metadata?.debugOTP) {
      console.log('   🔑 Debug OTP:', dobData.response.metadata.debugOTP);
    }
    console.log('');

    // Test 5: OTP Verification (using the OTP from step 4)
    const otpToUse = dobData.response.metadata?.debugOTP || '1234';
    console.log('5️⃣ Testing OTP Verification (using OTP:', otpToUse, ')...');
    const otpResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: otpToUse })
    });
    const otpData = await otpResponse.json();
    console.log('✅ OTP Response:', otpData.response.message);
    console.log('   State:', otpData.state.state);
    if (otpData.response.drm) {
      console.log('   DRM Cards:', otpData.response.drm.cards?.length || 0);
      if (otpData.response.drm.cards) {
        otpData.response.drm.cards.forEach((card, idx) => {
          console.log(`   Card ${idx + 1}:`, card.title);
        });
      }
    }
    console.log('');

    // Test 6: Loan Account Selection
    if (otpData.state.state === 'loan_accounts_displayed') {
      console.log('6️⃣ Testing Loan Account Selection...');
      const accountId = 'LOAN001234';
      const accountResponse = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId
        },
        body: JSON.stringify({ message: accountId })
      });
      const accountData = await accountResponse.json();
      console.log('✅ Account Response:', accountData.response.message.substring(0, 100) + '...');
      console.log('   State:', accountData.state.state);
      console.log('');
    }

    // Test 7: Language Restriction
    console.log('7️⃣ Testing Language Restriction...');
    const langResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: 'Hola, ¿cómo estás?' })
    });
    const langData = await langResponse.json();
    console.log('✅ Language Restriction Response:', langData.response.message);
    console.log('');

    // Test 8: Phone Number Change Edge Case
    console.log('8️⃣ Testing Phone Number Change Edge Case...');
    const newSessionResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to check my loan details' })
    });
    const newSessionData = await newSessionResponse.json();
    const newSessionId = newSessionData.sessionId;
    
    // Provide phone number
    await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': newSessionId
      },
      body: JSON.stringify({ message: '9876543210' })
    });
    
    // Say it's old number
    const changeResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': newSessionId
      },
      body: JSON.stringify({ message: 'Wait, that\'s my old number' })
    });
    const changeData = await changeResponse.json();
    console.log('✅ Phone Change Response:', changeData.response.message);
    console.log('   State:', changeData.state.state);
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
  }
}

testAPI();
