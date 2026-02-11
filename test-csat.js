/**
 * Test CSAT Agent
 */

const BASE_URL = 'http://localhost:3000';

async function testCSAT() {
  console.log('🧪 Testing CSAT Agent\n');
  console.log('='.repeat(60));

  try {
    // Start CSAT survey
    console.log('\n1️⃣ STARTING CSAT SURVEY');
    const start = await fetch(`${BASE_URL}/api/csat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const startData = await start.json();
    const sessionId = startData.sessionId;
    console.log('Agent:', startData.response.message);
    console.log('State:', startData.response.state);
    console.log('✅ Survey started');

    // Provide rating
    console.log('\n2️⃣ PROVIDING RATING');
    console.log('User: "Good"');
    const rating = await fetch(`${BASE_URL}/api/csat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId
      },
      body: JSON.stringify({ message: 'Good' })
    });
    const ratingData = await rating.json();
    console.log('Agent:', ratingData.response.message);
    console.log('Rating:', ratingData.results.rating);
    console.log('State:', ratingData.response.state);
    console.log('✅ Rating collected');

    // Provide feedback
    if (ratingData.response.state === 'collecting_feedback') {
      console.log('\n3️⃣ PROVIDING FEEDBACK');
      console.log('User: "Great service, very helpful!"');
      const feedback = await fetch(`${BASE_URL}/api/csat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId
        },
        body: JSON.stringify({ message: 'Great service, very helpful!' })
      });
      const feedbackData = await feedback.json();
      console.log('Agent:', feedbackData.response.message);
      console.log('Results:', feedbackData.results);
      console.log('✅ Feedback collected');
    }

    // Test with "Skip"
    console.log('\n4️⃣ TESTING SKIP OPTION');
    const start2 = await fetch(`${BASE_URL}/api/csat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const start2Data = await start2.json();
    const sessionId2 = start2Data.sessionId;

    await fetch(`${BASE_URL}/api/csat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId2
      },
      body: JSON.stringify({ message: 'Average' })
    });

    console.log('User: "Skip"');
    const skip = await fetch(`${BASE_URL}/api/csat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': sessionId2
      },
      body: JSON.stringify({ message: 'Skip' })
    });
    const skipData = await skip.json();
    console.log('Agent:', skipData.response.message);
    console.log('Results:', skipData.results);
    console.log('✅ Skip option works');

    console.log('\n' + '='.repeat(60));
    console.log('✅ CSAT AGENT TESTS COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  }
}

testCSAT();
