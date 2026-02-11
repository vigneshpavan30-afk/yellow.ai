/**
 * Test the invalid DOB scenario from the screenshot
 */

const BASE_URL = 'http://localhost:3000';

async function testInvalidDOB() {
  console.log('🧪 Testing Invalid DOB Scenario\n');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Start conversation
    console.log('\n1️⃣ Starting conversation...');
    const step1 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to check my loan details' })
    });
    const data1 = await step1.json();
    const sessionId = data1.sessionId;
    console.log('✅ Intent recognized');
    
    // Step 2: Provide phone number
    console.log('\n2️⃣ Providing phone number: 7569791607');
    await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '7569791607' })
    });
    console.log('✅ Phone number accepted');
    
    // Step 3: Provide INVALID DOB (from screenshot)
    console.log('\n3️⃣ Providing INVALID DOB: 55/85/7894');
    const step3 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '55/85/7894' })
    });
    const data3 = await step3.json();
    console.log(`🤖 Agent Response: ${data3.response.message}`);
    console.log(`   Validation Error: ${data3.response.validationError ? '✅ Yes' : '❌ No'}`);
    
    if (data3.response.validationError) {
      console.log('✅ Invalid DOB correctly rejected!');
    } else {
      console.log('❌ Invalid DOB was accepted (should be rejected)');
    }
    
    // Step 4: Provide VALID DOB
    console.log('\n4️⃣ Providing VALID DOB: 15/06/1990');
    const step4 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '15/06/1990' })
    });
    const data4 = await step4.json();
    console.log(`🤖 Agent Response: ${data4.response.message}`);
    
    if (data4.response.message.toLowerCase().includes('otp')) {
      console.log('✅ Valid DOB accepted, OTP generated!');
    } else {
      console.log('❌ Valid DOB was rejected (should be accepted)');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Wait for server to start
setTimeout(() => {
  testInvalidDOB();
}, 2000);
