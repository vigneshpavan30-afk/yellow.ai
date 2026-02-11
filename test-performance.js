/**
 * Test Performance - Measure response times
 */

const BASE_URL = 'http://localhost:3000';

async function testPerformance() {
  console.log('⚡ Performance Test\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Invalid DOB (should be instant)
    console.log('\n1️⃣ Testing Invalid DOB Response Time...');
    const start1 = Date.now();
    const res1 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to check my loan details' })
    });
    const data1 = await res1.json();
    const sessionId = data1.sessionId;
    
    await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '9876543210' })
    });
    
    const startInvalid = Date.now();
    const resInvalid = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '55/85/7894' })
    });
    const dataInvalid = await resInvalid.json();
    const timeInvalid = Date.now() - startInvalid;
    
    console.log(`   Response: ${dataInvalid.response.message}`);
    console.log(`   ⏱️  Response Time: ${timeInvalid}ms`);
    console.log(`   ${timeInvalid < 100 ? '✅ FAST' : timeInvalid < 500 ? '⚠️  MODERATE' : '❌ SLOW'}`);
    
    // Test 2: Valid DOB (should be fast)
    console.log('\n2️⃣ Testing Valid DOB Response Time...');
    const startValid = Date.now();
    const resValid = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '15/06/1990' })
    });
    const dataValid = await resValid.json();
    const timeValid = Date.now() - startValid;
    
    console.log(`   Response: ${dataValid.response.message.substring(0, 50)}...`);
    console.log(`   ⏱️  Response Time: ${timeValid}ms`);
    console.log(`   ${timeValid < 1000 ? '✅ FAST' : timeValid < 3000 ? '⚠️  MODERATE' : '❌ SLOW'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Performance Test Completed');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setTimeout(() => {
  testPerformance();
}, 2000);
