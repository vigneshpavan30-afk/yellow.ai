/**
 * Test Gemini AI Integration
 */

const BASE_URL = 'http://localhost:3000';

async function testAIIntegration() {
  console.log('🤖 Testing Gemini AI Integration\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Intent recognition with natural language
    console.log('\n1️⃣ TESTING AI INTENT RECOGNITION');
    console.log('User: "Can you help me see my loan information?"');
    const test1 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Can you help me see my loan information?' })
    });
    const data1 = await test1.json();
    console.log('Agent:', data1.response.message);
    console.log('AI Generated:', data1.response.aiGenerated || false);
    console.log('State:', data1.state.state);
    console.log('✅ Intent recognition test');

    const sessionId = data1.sessionId;

    // Test 2: Natural language phone number
    console.log('\n2️⃣ TESTING AI DATA EXTRACTION');
    console.log('User: "My phone is 9876543210"');
    const test2 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: 'My phone is 9876543210' })
    });
    const data2 = await test2.json();
    console.log('Agent:', data2.response.message);
    console.log('AI Generated:', data2.response.aiGenerated || false);
    console.log('State:', data2.state.state);
    console.log('✅ Data extraction test');

    // Test 3: Natural language DOB
    console.log('\n3️⃣ TESTING AI DOB EXTRACTION');
    console.log('User: "I was born on June 15, 1990"');
    const test3 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: 'I was born on June 15, 1990' })
    });
    const data3 = await test3.json();
    console.log('Agent:', data3.response.message);
    console.log('AI Generated:', data3.response.aiGenerated || false);
    console.log('State:', data3.state.state);
    if (data3.response.metadata?.debugOTP) {
      console.log('🔑 Generated OTP:', data3.response.metadata.debugOTP);
    }
    console.log('✅ DOB extraction test');

    // Test 4: General inquiry (non-loan related)
    console.log('\n4️⃣ TESTING AI GENERAL INQUIRY');
    const newSession = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, how are you?' })
    });
    const generalData = await newSession.json();
    console.log('User: "Hello, how are you?"');
    console.log('Agent:', generalData.response.message);
    console.log('AI Generated:', generalData.response.aiGenerated || false);
    console.log('✅ General inquiry test');

    console.log('\n' + '='.repeat(60));
    console.log('✅ AI INTEGRATION TESTS COMPLETED!');
    console.log('='.repeat(60));
    console.log('\nNote: If AI Generated is true, Gemini AI is being used.');
    console.log('If false, the system is using fallback rule-based logic.');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testAIIntegration();
