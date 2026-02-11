/**
 * Test Gemini API directly to find the correct model
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyD9WvpBjGYKqYvdrMQm_5-x-uavJOsrLKo';
const genAI = new GoogleGenerativeAI(API_KEY);

async function testModels() {
  console.log('🔍 Testing Gemini API Models\n');
  console.log('='.repeat(60));

  // List of possible model names to try
  const modelsToTry = [
    'gemini-pro',
    'models/gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro',
    'gemini-1.0-pro-latest'
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`\nTesting: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Hello" in one word');
      const response = await result.response;
      const text = response.text();
      console.log(`✅ SUCCESS! Model works: ${modelName}`);
      console.log(`   Response: ${text}`);
      console.log('\n' + '='.repeat(60));
      return modelName; // Return the first working model
    } catch (error) {
      console.log(`❌ Failed: ${error.message.split('\n')[0]}`);
    }
  }

  // Try to list available models
  console.log('\n\nTrying to list available models...');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    if (data.models) {
      console.log('\n✅ Available models:');
      data.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`   - ${m.name}`);
        }
      });
    }
  } catch (error) {
    console.log('❌ Could not list models:', error.message);
  }

  return null;
}

testModels().then(workingModel => {
  if (workingModel) {
    console.log(`\n✅ Recommended model to use: ${workingModel}`);
  } else {
    console.log('\n⚠️  No working model found. Please check:');
    console.log('   1. API key is valid');
    console.log('   2. Gemini API is enabled in Google Cloud Console');
    console.log('   3. API key has proper permissions');
  }
}).catch(console.error);
