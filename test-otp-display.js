/**
 * Test OTP Display
 */

const BASE_URL = 'http://localhost:3000';

async function testOTPDisplay() {
  console.log('🔑 Testing OTP Display\n');
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
    
    // Step 3: Provide valid DOB
    console.log('\n3️⃣ Providing valid DOB: 22/03/2004');
    const step3 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '22/03/2004' })
    });
    const data3 = await step3.json();
    console.log('\n🤖 Agent Response:');
    console.log(data3.response.message);
    console.log('\n📊 Response Details:');
    console.log(`   OTP Generated: ${data3.response.metadata?.otpGenerated ? '✅ Yes' : '❌ No'}`);
    console.log(`   OTP Value: ${data3.response.metadata?.otp || 'Not found'}`);
    console.log(`   State: ${data3.state.state}`);
    
    if (data3.response.metadata?.otp) {
      console.log(`\n✅ OTP is displayed in the response: ${data3.response.metadata.otp}`);
    } else {
      console.log('\n❌ OTP not found in response');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test Completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setTimeout(() => {
  testOTPDisplay();
}, 2000);
