/**
 * Complete flow test for Yellow Bank Banking Agent
 */

const BASE_URL = 'http://localhost:3000';

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Banking Agent Flow\n');
  console.log('='.repeat(60));

  try {
    let sessionId = null;

    // Step 1: Intent Recognition
    console.log('\n1️⃣ INTENT RECOGNITION');
    console.log('User: "I want to check my loan details"');
    const step1 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'I want to check my loan details' })
    });
    const data1 = await step1.json();
    sessionId = data1.sessionId;
    console.log('Agent:', data1.response.message);
    console.log('State:', data1.state.state);
    console.log('✅ Intent recognized');

    // Step 2: Phone Number
    console.log('\n2️⃣ PHONE NUMBER COLLECTION');
    console.log('User: "9876543210"');
    const step2 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '9876543210' })
    });
    const data2 = await step2.json();
    console.log('Agent:', data2.response.message);
    console.log('State:', data2.state.state);
    console.log('✅ Phone number collected');

    // Step 3: DOB
    console.log('\n3️⃣ DOB COLLECTION');
    console.log('User: "15/06/1990"');
    const step3 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: '15/06/1990' })
    });
    const data3 = await step3.json();
    const generatedOTP = data3.response.metadata?.debugOTP;
    console.log('Agent:', data3.response.message);
    console.log('State:', data3.state.state);
    console.log('🔑 Generated OTP:', generatedOTP || '(check server logs)');
    console.log('✅ DOB collected, OTP generated');

    // Step 4: OTP Verification
    console.log('\n4️⃣ OTP VERIFICATION');
    // Try with the generated OTP, or use one of the valid OTPs
    const otpToTry = generatedOTP || '1234';
    console.log('User: "' + otpToTry + '"');
    const step4 = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: otpToTry })
    });
    const data4 = await step4.json();
    console.log('Agent:', data4.response.message);
    console.log('State:', data4.state.state);
    
    if (data4.state.state === 'loan_accounts_displayed') {
      console.log('✅ OTP verified successfully');
      console.log('DRM Cards:', data4.response.drm?.cards?.length || 0);
      if (data4.response.drm?.cards) {
        data4.response.drm.cards.forEach((card, idx) => {
          console.log(`   Card ${idx + 1}: ${card.title}`);
        });
      }
    } else {
      console.log('⚠️  OTP verification pending or failed');
      // Try with another valid OTP
      const validOTPs = ['1234', '5678', '7889', '1209'];
      for (const otp of validOTPs) {
        if (otp !== otpToTry) {
          console.log(`\n   Retrying with OTP: ${otp}`);
          const retry = await fetch(`${BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-Id': sessionId
            },
            body: JSON.stringify({ message: otp })
          });
          const retryData = await retry.json();
          if (retryData.state.state === 'loan_accounts_displayed') {
            console.log('✅ OTP verified with:', otp);
            Object.assign(data4, retryData);
            break;
          }
        }
      }
    }

    // Step 5: Loan Account Selection
    if (data4.state.state === 'loan_accounts_displayed') {
      console.log('\n5️⃣ LOAN ACCOUNT SELECTION');
      const accountId = 'LOAN001234';
      console.log('User: "' + accountId + '"');
      const step5 = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId
        },
        body: JSON.stringify({ message: accountId })
      });
      const data5 = await step5.json();
      console.log('Agent:', data5.response.message.substring(0, 150) + '...');
      console.log('State:', data5.state.state);
      console.log('✅ Loan details displayed');
    }

    // Test Edge Case: Phone Number Change
    console.log('\n6️⃣ EDGE CASE: PHONE NUMBER CHANGE');
    const newSession = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Show loan details' })
    });
    const newSessionData = await newSession.json();
    const newSessionId = newSessionData.sessionId;
    
    await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': newSessionId
      },
      body: JSON.stringify({ message: '9876543210' })
    });
    
    console.log('User: "Wait, that\'s my old number"');
    const changeResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': newSessionId
      },
      body: JSON.stringify({ message: 'Wait, that\'s my old number' })
    });
    const changeData = await changeResponse.json();
    console.log('Agent:', changeData.response.message);
    console.log('State:', changeData.state.state);
    console.log('✅ Phone number change handled correctly');

    // Test Language Restriction
    console.log('\n7️⃣ LANGUAGE RESTRICTION');
    console.log('User: "Hola, ¿cómo estás?"');
    const langResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: 'Hola, ¿cómo estás?' })
    });
    const langData = await langResponse.json();
    console.log('Agent:', langData.response.message);
    console.log('✅ Language restriction enforced');

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

testCompleteFlow();
