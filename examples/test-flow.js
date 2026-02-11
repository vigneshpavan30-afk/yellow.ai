/**
 * Example test script for Yellow Bank Banking Agent
 * Demonstrates the complete conversation flow
 */

// This is a reference example - in practice, you'd use the actual API

const BASE_URL = 'http://localhost:3000';

async function testBankingAgent() {
  let sessionId = null;

  console.log('🧪 Testing Yellow Bank Banking Agent\n');

  // Step 1: Intent Recognition
  console.log('1️⃣ Intent Recognition');
  const intentResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'I want to check my loan details' })
  });
  const intentData = await intentResponse.json();
  sessionId = intentData.sessionId;
  console.log('Response:', intentData.response.message);
  console.log('Session ID:', sessionId);
  console.log('State:', intentData.state.state);
  console.log('');

  // Step 2: Phone Number Collection
  console.log('2️⃣ Phone Number Collection');
  const phoneResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId
    },
    body: JSON.stringify({ message: '9876543210' })
  });
  const phoneData = await phoneResponse.json();
  console.log('Response:', phoneData.response.message);
  console.log('State:', phoneData.state.state);
  console.log('');

  // Step 3: DOB Collection
  console.log('3️⃣ DOB Collection');
  const dobResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId
    },
    body: JSON.stringify({ message: '15/06/1990' })
  });
  const dobData = await dobResponse.json();
  console.log('Response:', dobData.response.message);
  console.log('State:', dobData.state.state);
  if (dobData.response.metadata?.debugOTP) {
    console.log('🔑 Debug OTP:', dobData.response.metadata.debugOTP);
  }
  console.log('');

  // Step 4: OTP Verification
  console.log('4️⃣ OTP Verification');
  const otpResponse = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId
    },
    body: JSON.stringify({ message: '1234' }) // Use the OTP from step 3
  });
  const otpData = await otpResponse.json();
  console.log('Response:', otpData.response.message);
  console.log('State:', otpData.state.state);
  if (otpData.response.drm) {
    console.log('DRM Cards:', otpData.response.drm.cards?.length || 0);
  }
  console.log('');

  // Step 5: Loan Account Selection
  if (otpData.state.state === 'loan_accounts_displayed') {
    console.log('5️⃣ Loan Account Selection');
    const accountResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: 'LOAN001234' })
    });
    const accountData = await accountResponse.json();
    console.log('Response:', accountData.response.message);
    console.log('State:', accountData.state.state);
    console.log('');
  }

  // Step 6: CSAT Survey
  console.log('6️⃣ CSAT Survey');
  const csatResponse = await fetch(`${BASE_URL}/api/csat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId
    },
    body: JSON.stringify({ message: 'Good' })
  });
  const csatData = await csatResponse.json();
  console.log('Response:', csatData.response.message);
  console.log('Results:', csatData.results);
  console.log('');

  console.log('✅ Test flow completed!');
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBankingAgent().catch(console.error);
}

export { testBankingAgent };
