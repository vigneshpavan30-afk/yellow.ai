# Yellow Bank Frontend

Modern, responsive frontend for the Yellow Bank Banking Agent with a beautiful yellow color scheme.

## Features

- 🎨 **Yellow Bank Branding** - Beautiful yellow color scheme throughout
- 💬 **Chat Interface** - Modern, intuitive chat UI
- 🃏 **Dynamic Rich Media Cards** - Interactive loan account cards
- 📊 **Loan Details Sidebar** - Clean display of loan information
- ⭐ **CSAT Survey** - Customer satisfaction rating modal
- 🤖 **AI-Powered** - Real-time responses from Gemini AI
- 📱 **Responsive Design** - Works on desktop and mobile

## Color Scheme

- **Primary Yellow**: #FFD700 (Gold)
- **Accent Yellow**: #FFC107 (Amber)
- **Dark Background**: #1a1a1a
- **Dark Surface**: #2d2d2d

## Usage

The frontend is automatically served when you start the server:

```bash
npm start
```

Then open your browser to: `http://localhost:3000`

## File Structure

```
frontend/
├── index.html    # Main HTML structure
├── styles.css    # Yellow Bank styling
└── app.js        # Frontend application logic
```

## Integration

The frontend communicates with the backend API at `http://localhost:3000/api/chat` and handles:
- Chat messages
- DRM cards for loan accounts
- Quick replies
- CSAT surveys
- Session management
