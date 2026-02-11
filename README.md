# Yellow Bank Banking Agent

A Gen AI Banking Agent system for Yellow Bank that handles loan details inquiries with secure authentication, multi-step workflows, and Dynamic Rich Media (DRM) interactions.

## Features

- **Intent Recognition**: Detects user intent to view loan details
- **Multi-Step Authentication**: Phone number + DOB → OTP verification
- **Token Optimization**: Middleware filters unnecessary API response fields
- **Dynamic Rich Media**: Interactive cards for loan accounts and quick replies for details
- **Edge Case Handling**: Phone number changes, API failures, OTP retries
- **CSAT Agent**: Customer satisfaction survey integration
- **Language Restriction**: English-only communication enforcement

## Architecture

```
yellow-bank/
├── agents/
│   ├── bankingAgent.js      # Main banking agent logic
│   └── csatAgent.js         # CSAT survey agent
├── config/
│   ├── systemPrompt.js      # System prompt for the agent
│   └── agentConfig.js       # Agent configuration
├── workflows/
│   ├── triggerOTP.js        # OTP generation and verification
│   ├── getLoanAccounts.js   # Loan accounts retrieval (with token optimization)
│   └── loanDetails.js      # Detailed loan information
├── handlers/
│   └── drmHandler.js        # Dynamic Rich Media card creation
├── utils/
│   ├── tokenOptimizer.js    # Token optimization middleware
│   └── languageDetector.js  # Language restriction enforcement
├── server.js                # Express server
├── package.json
└── README.md
```

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm
- Google Gemini API Key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure API Key:
   - The Gemini API key is already configured in the code
   - To use a different key, set the `GEMINI_API_KEY` environment variable:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```
   - Or create a `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### AI Integration

This agent uses **Google Gemini AI** for:
- Intent recognition
- Natural language understanding
- Response generation
- Data extraction

The agent maintains workflow logic while using AI to generate more natural and contextual responses.

## API Endpoints

### POST `/api/chat`
Main chat endpoint for banking agent conversations.

**Request:**
```json
{
  "message": "I want to check my loan details",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_1234567890",
  "response": {
    "message": "I'll help you view your loan details...",
    "state": "collecting_phone",
    "type": "text"
  },
  "state": {
    "state": "collecting_phone",
    "intent": "view_loan_details"
  }
}
```

### POST `/api/csat`
CSAT survey endpoint.

**Request:**
```json
{
  "message": "Good",
  "sessionId": "session-id"
}
```

### GET `/api/session/:sessionId`
Get current session state.

### POST `/api/session/:sessionId/reset`
Reset a session.

### GET `/health`
Health check endpoint.

## Workflow

### Happy Path

1. **Intent Recognition**: User says "I want to check my loan details"
2. **Data Collection**: Agent requests Phone Number → DOB
3. **OTP Trigger**: System generates OTP (1234, 5678, 7889, or 1209)
4. **OTP Verification**: User provides OTP, agent verifies
5. **Loan Accounts Display**: Agent shows loan accounts as interactive cards
6. **Account Selection**: User selects an account
7. **Loan Details Display**: Agent shows detailed loan information with "Rate our chat" button

### Edge Cases

- **Phone Number Change**: If user says "Wait, that's my old number", agent clears authentication and restarts collection
- **API Failures**: Graceful error handling with retry options
- **Invalid OTP**: Up to 3 attempts before requesting new OTP
- **Language Restriction**: Non-English messages are politely declined

## Token Optimization

The `getLoanAccounts` workflow implements token optimization:

- **Full API Response**: Contains 15+ fields (internal codes, audit dates, metadata, etc.)
- **Optimized Response**: Extracts only:
  - `loanAccountId`
  - `typeOfLoan`
  - `tenure`

This is handled by the `tokenOptimizer.js` middleware which filters unnecessary data before sending to the LLM.

## Mock OTP Values

For testing, the OTP API returns one of these predetermined values:
- `1234`
- `5678`
- `7889`
- `1209`

## Dynamic Rich Media (DRM)

### Loan Accounts DRM
Interactive cards with:
- Account title (Loan Type + Account ID)
- Description (Tenure)
- Select button with Account ID in message

### Loan Details DRM
Quick replies with:
- Formatted loan details
- "Rate our chat" button (triggers CSAT)
- "View Another Account" button

## Testing

### Example Conversation Flow

1. Start conversation:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to check my loan details"}'
```

2. Provide phone number:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: your-session-id" \
  -d '{"message": "9876543210"}'
```

3. Provide DOB:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: your-session-id" \
  -d '{"message": "15/06/1990"}'
```

4. Enter OTP (check response for debug OTP in development mode):
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: your-session-id" \
  -d '{"message": "1234"}'
```

5. Select loan account:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: your-session-id" \
  -d '{"message": "LOAN001234"}'
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Security Notes

- In production, never expose OTP values to the client
- Use secure session storage (Redis, database)
- Implement rate limiting
- Add proper authentication for API endpoints
- Encrypt sensitive data in transit and at rest

## License

ISC
