/**
 * Google Gemini AI Service
 * Handles AI-powered conversation generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with API key
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyD9WvpBjGYKqYvdrMQm_5-x-uavJOsrLKo';
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini model - using models/gemini-2.5-flash for best performance
// Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-pro-latest, gemini-flash-latest
let model;
try {
  // Use gemini-2.5-flash (fast and efficient)
  model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
  console.log('✅ Gemini AI initialized with models/gemini-2.5-flash');
} catch (e) {
  try {
    // Fallback to gemini-pro-latest
    model = genAI.getGenerativeModel({ model: 'models/gemini-pro-latest' });
    console.log('✅ Gemini AI initialized with models/gemini-pro-latest');
  } catch (e2) {
    try {
      // Fallback to gemini-flash-latest
      model = genAI.getGenerativeModel({ model: 'models/gemini-flash-latest' });
      console.log('✅ Gemini AI initialized with models/gemini-flash-latest');
    } catch (e3) {
      console.warn('⚠️  Could not initialize Gemini model, will use fallback rule-based logic');
      console.warn('   Error:', e3.message);
      model = null;
    }
  }
}

/**
 * Generate AI response using Gemini
 * @param {string} systemPrompt - System instructions for the agent
 * @param {Array} conversationHistory - Previous conversation messages
 * @param {string} userMessage - Current user message
 * @param {Object} context - Additional context (state, collected data, etc.)
 * @returns {Promise<string>} - AI-generated response
 */
export async function generateAIResponse(systemPrompt, conversationHistory, userMessage, context = {}) {
  if (!model) {
    throw new Error('Gemini model not initialized');
  }
  
  try {
    // Build the conversation prompt
    let prompt = systemPrompt + '\n\n';
    
    // Add context information
    if (context.state) {
      prompt += `Current State: ${context.state}\n`;
    }
    if (context.intent) {
      prompt += `User Intent: ${context.intent}\n`;
    }
    if (context.collectedData) {
      prompt += `Collected Data: ${JSON.stringify(context.collectedData)}\n`;
    }
    if (context.availableActions) {
      prompt += `Available Actions: ${context.availableActions.join(', ')}\n`;
    }
    
    prompt += '\nConversation History:\n';
    
    // Add conversation history (last 10 messages to save tokens)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    }
    
    prompt += `\nUser: ${userMessage}\n`;
    prompt += 'Assistant:';
    
    // Generate response with shorter timeout for better performance
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI request timeout')), 3000)
      )
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    // Don't throw, let the caller handle fallback
    throw error;
  }
}

/**
 * Generate AI response with structured output
 * @param {string} systemPrompt - System instructions
 * @param {Array} conversationHistory - Conversation history
 * @param {string} userMessage - User message
 * @param {Object} context - Context information
 * @returns {Promise<Object>} - Structured response with message and metadata
 */
export async function generateStructuredResponse(systemPrompt, conversationHistory, userMessage, context = {}) {
  try {
    const response = await generateAIResponse(systemPrompt, conversationHistory, userMessage, context);
    
    return {
      message: response,
      aiGenerated: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Fallback to a default response if AI fails
    return {
      message: "I'm here to help you with your loan details. How can I assist you?",
      aiGenerated: false,
      error: error.message
    };
  }
}

/**
 * Detect intent using AI
 * @param {string} userMessage - User message
 * @param {Array} conversationHistory - Conversation history
 * @returns {Promise<string>} - Detected intent
 */
export async function detectIntent(userMessage, conversationHistory = []) {
  try {
    const intentPrompt = `Analyze the following user message and determine the intent. 
Respond with ONLY one of these intents: "view_loan_details", "general_inquiry", "other", or "none".

User message: "${userMessage}"

Intent:`;

    const result = await model.generateContent(intentPrompt);
    const response = await result.response;
    const intent = response.text().trim().toLowerCase();
    
    // Validate intent
    const validIntents = ['view_loan_details', 'general_inquiry', 'other', 'none'];
    if (validIntents.includes(intent)) {
      return intent;
    }
    
    // Check if it contains loan-related keywords
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('loan') && (lowerMessage.includes('detail') || lowerMessage.includes('check') || lowerMessage.includes('view'))) {
      return 'view_loan_details';
    }
    
    return 'none';
  } catch (error) {
    console.error('Intent detection error:', error);
    // Fallback to keyword-based detection
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('loan') && (lowerMessage.includes('detail') || lowerMessage.includes('check') || lowerMessage.includes('view'))) {
      return 'view_loan_details';
    }
    return 'none';
  }
}

/**
 * Extract structured data from user message using AI
 * @param {string} userMessage - User message
 * @param {string} dataType - Type of data to extract (phone, dob, otp, accountId)
 * @returns {Promise<string|null>} - Extracted data or null
 */
export async function extractData(userMessage, dataType) {
  try {
    const extractionPrompt = `Extract the ${dataType} from the following user message. 
If ${dataType} is found, respond with ONLY the ${dataType}. If not found, respond with "null".

User message: "${userMessage}"

${dataType}:`;

    const result = await model.generateContent(extractionPrompt);
    const response = await result.response;
    const extracted = response.text().trim();
    
    if (extracted.toLowerCase() === 'null' || extracted.toLowerCase() === 'none') {
      return null;
    }
    
    return extracted;
  } catch (error) {
    console.error('Data extraction error:', error);
    return null;
  }
}
