/**
 * Quick test to demonstrate the banking agent
 */

const BASE_URL = 'http://localhost:3000';

async function quickTest() {
  console.log('💬 Yellow Bank Banking Agent - Quick Test\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Start conversation
    console.log('\n👤 User: "I want to check my loan details"');
    const res1 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to check my loan details' })
    });
    const data1 = await res1.json();
    console.log(`🤖 Agent: ${data1.response.message}`);
    console.log(`   AI Generated: ${data1.response.aiGenerated ? '✅ Yes' : '❌ No'}`);
    
    const sessionId = data1.sessionId;
    
    // Test 2: Provide phone number
    console.log('\n👤 User: "9876543210"');
    const res2 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '9876543210' })
    });
    const data2 = await res2.json();
    console.log(`🤖 Agent: ${data2.response.message}`);
    console.log(`   AI Generated: ${data2.response.aiGenerated ? '✅ Yes' : '❌ No'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Server is ready! You can now interact with the agent.');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
