/**
 * Main Server File
 * Express server for Yellow Bank Banking Agent API
 */

import express from 'express';
import cors from 'cors';
import { BankingAgent } from './agents/bankingAgent.js';
import { CSATAgent } from './agents/csatAgent.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS configuration - allow all origins for deployed version
app.use(cors({
  origin: '*', // Allow all origins (for deployed version)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Session-Id'],
  credentials: false
}));
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static('frontend'));

// Serve frontend on root
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './frontend' });
});

// In-memory session storage (in production, use Redis or database)
const agentSessions = new Map();
const csatSessions = new Map();

/**
 * Generate or retrieve session ID
 */
function getSessionId(req) {
  let sessionId = req.headers['x-session-id'] || req.body.sessionId;
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return sessionId;
}

/**
 * Get or create banking agent for session
 */
function getBankingAgent(sessionId) {
  if (!agentSessions.has(sessionId)) {
    agentSessions.set(sessionId, new BankingAgent(sessionId));
  }
  return agentSessions.get(sessionId);
}

/**
 * Get or create CSAT agent for session
 */
function getCSATAgent(sessionId) {
  if (!csatSessions.has(sessionId)) {
    csatSessions.set(sessionId, new CSATAgent(sessionId));
  }
  return csatSessions.get(sessionId);
}

// Routes

/**
 * Main chat endpoint - handles banking agent conversations
 */
app.post('/api/chat', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    const agent = getBankingAgent(sessionId);
    const response = await agent.processMessage(message);

    res.json({
      success: true,
      sessionId: sessionId,
      response: response,
      state: agent.getState()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

/**
 * CSAT Survey endpoint
 */
app.post('/api/csat', (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { message } = req.body;

    const csatAgent = getCSATAgent(sessionId);
    
    // If no message, start the survey
    if (!message) {
      return res.json({
        success: true,
        sessionId: sessionId,
        response: {
          message: "Thank you for using our service! Please rate your experience: Good, Average, or Bad.",
          state: "collecting_rating",
          type: "text"
        }
      });
    }

    const response = csatAgent.processMessage(message);

    res.json({
      success: true,
      sessionId: sessionId,
      response: response,
      results: csatAgent.getResults()
    });
  } catch (error) {
    console.error('CSAT error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
});

/**
 * Get session state
 */
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const agent = getBankingAgent(sessionId);
    
    res.json({
      success: true,
      state: agent.getState()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Reset session
 */
app.post('/api/session/:sessionId/reset', (req, res) => {
  try {
    const { sessionId } = req.params;
    agentSessions.delete(sessionId);
    csatSessions.delete(sessionId);
    
    res.json({
      success: true,
      message: "Session reset successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Yellow Bank Banking Agent',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Documentation endpoint
 */
app.get('/api', (req, res) => {
  res.json({
    name: "Yellow Bank Banking Agent API",
    version: "1.0.0",
    endpoints: {
      "POST /api/chat": "Main chat endpoint for banking agent conversations",
      "POST /api/csat": "CSAT survey endpoint",
      "GET /api/session/:sessionId": "Get session state",
      "POST /api/session/:sessionId/reset": "Reset session",
      "GET /health": "Health check"
    },
    usage: {
      chat: {
        method: "POST",
        url: "/api/chat",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": "optional-session-id"
        },
        body: {
          message: "User message",
          sessionId: "optional-session-id"
        }
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Yellow Bank Banking Agent server running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});
