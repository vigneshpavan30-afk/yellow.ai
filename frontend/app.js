// Yellow Bank Banking Agent - Frontend Application

// Auto-detect API base URL (works for both localhost and deployed)
const API_BASE_URL = window.location.origin;
let sessionId = null;
let isWaitingForResponse = false;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const sidebar = document.getElementById('sidebar');
const sidebarContent = document.getElementById('sidebarContent');
const csatModal = document.getElementById('csatModal');
const closeModal = document.getElementById('closeModal');
const csatContent = document.getElementById('csatContent');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    closeModal.addEventListener('click', () => {
        csatModal.classList.remove('active');
    });
    
    csatModal.addEventListener('click', (e) => {
        if (e.target === csatModal) {
            csatModal.classList.remove('active');
        }
    });
});

// Send Message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isWaitingForResponse) return;
    
    // Add user message to chat
    addMessage('user', message);
    messageInput.value = '';
    setInputDisabled(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(sessionId && { 'X-Session-Id': sessionId })
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.sessionId) {
            sessionId = data.sessionId;
        }
        
        // Handle response
        handleAgentResponse(data);
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('assistant', "I'm experiencing a technical issue. Please try again in a moment.");
    } finally {
        setInputDisabled(false);
    }
}

// Handle Agent Response
function handleAgentResponse(data) {
    const response = data.response;
    
    // Remove welcome message if exists
    const welcomeMsg = chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Handle different response types
    if (response.type === 'drm' && response.drm) {
        handleDRMResponse(response.drm, response.message);
    } else if (response.type === 'csat_redirect') {
        showCSATModal();
    } else {
        addMessage('assistant', response.message);
        
        // Show quick replies if available
        if (response.drm && response.drm.quickReplies) {
            showQuickReplies(response.drm.quickReplies);
        }
    }
    
    // Handle loan details in sidebar
    if (data.state.state === 'loan_details_displayed' && response.drm) {
        showLoanDetails(response.drm);
    }
}

// Handle DRM Response
function handleDRMResponse(drm, message) {
    if (drm.type === 'carousel' && drm.cards) {
        // Show loan accounts as cards
        addMessage('assistant', message);
        showLoanAccountCards(drm.cards);
    } else if (drm.type === 'quick_replies') {
        addMessage('assistant', drm.message);
        showQuickReplies(drm.quickReplies);
    }
}

// Show Loan Account Cards
function showLoanAccountCards(cards) {
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'drm-cards';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'drm-card';
        cardElement.innerHTML = `
            <div class="drm-card-title">${card.title}</div>
            <div class="drm-card-description">${card.description}</div>
            <button class="drm-card-button" data-account-id="${card.buttons[0].message}">
                ${card.buttons[0].label}
            </button>
        `;
        
        cardElement.querySelector('button').addEventListener('click', () => {
            const accountId = cardElement.querySelector('button').dataset.accountId;
            sendAccountSelection(accountId);
        });
        
        cardsContainer.appendChild(cardElement);
    });
    
    chatMessages.appendChild(cardsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Account Selection
async function sendAccountSelection(accountId) {
    addMessage('user', accountId);
    setInputDisabled(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId
            },
            body: JSON.stringify({ message: accountId })
        });
        
        const data = await response.json();
        handleAgentResponse(data);
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('assistant', "I'm experiencing a technical issue. Please try again.");
    } finally {
        setInputDisabled(false);
    }
}

// Show Quick Replies
function showQuickReplies(quickReplies) {
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'quick-replies';
    
    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-button';
        button.textContent = reply.label;
        button.addEventListener('click', () => {
            if (reply.action === 'csat_survey') {
                showCSATModal();
            } else if (reply.action === 'back_to_accounts') {
                sendMessage(reply.message);
            } else {
                sendMessage(reply.message);
            }
        });
        repliesContainer.appendChild(button);
    });
    
    chatMessages.appendChild(repliesContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show Loan Details in Sidebar
function showLoanDetails(drm) {
    sidebarContent.innerHTML = `
        <h2 style="color: var(--yellow-primary); margin-bottom: 1rem;">Loan Account Details</h2>
        <div class="loan-details">
            ${parseLoanDetails(drm.message)}
        </div>
    `;
    sidebar.style.display = 'block';
}

// Parse Loan Details from Message
function parseLoanDetails(message) {
    const lines = message.split('\n').filter(line => line.trim());
    let html = '';
    
    lines.forEach(line => {
        if (line.includes(':')) {
            const [label, value] = line.split(':').map(s => s.trim());
            if (label && value) {
                html += `
                    <div class="loan-detail-item">
                        <span class="loan-detail-label">${label}</span>
                        <span class="loan-detail-value">${value}</span>
                    </div>
                `;
            }
        }
    });
    
    return html || '<p>Loan details will be displayed here.</p>';
}

// Show CSAT Modal
function showCSATModal() {
    csatContent.innerHTML = `
        <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
            Thank you for using Yellow Bank! Please rate your experience.
        </p>
        <div class="csat-rating">
            <button class="rating-button good" data-rating="good">Good</button>
            <button class="rating-button average" data-rating="average">Average</button>
            <button class="rating-button bad" data-rating="bad">Bad</button>
        </div>
        <div id="csatFeedback" style="display: none; margin-top: 1.5rem;">
            <textarea 
                id="feedbackInput" 
                placeholder="Please share your feedback (optional)"
                style="width: 100%; padding: 1rem; background: var(--dark-surface-light); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-family: inherit; resize: vertical; min-height: 100px;"
            ></textarea>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <button id="submitFeedback" style="flex: 1; padding: 0.75rem; background: var(--yellow-primary); color: #000; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Submit
                </button>
                <button id="skipFeedback" style="flex: 1; padding: 0.75rem; background: transparent; color: var(--text-secondary); border: 1px solid var(--border); border-radius: 8px; font-weight: 600; cursor: pointer;">
                    Skip
                </button>
            </div>
        </div>
    `;
    
    csatModal.classList.add('active');
    
    // Handle rating selection
    const ratingButtons = csatContent.querySelectorAll('.rating-button');
    ratingButtons.forEach(button => {
        button.addEventListener('click', () => {
            ratingButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const rating = button.dataset.rating;
            submitCSATRating(rating);
        });
    });
}

// Submit CSAT Rating
async function submitCSATRating(rating) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/csat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId
            },
            body: JSON.stringify({ message: rating })
        });
        
        const data = await response.json();
        
        // Show feedback input
        const feedbackDiv = document.getElementById('csatFeedback');
        feedbackDiv.style.display = 'block';
        
        // Handle feedback submission
        document.getElementById('submitFeedback').addEventListener('click', async () => {
            const feedback = document.getElementById('feedbackInput').value;
            await submitCSATFeedback(feedback);
        });
        
        document.getElementById('skipFeedback').addEventListener('click', async () => {
            await submitCSATFeedback('Skip');
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Submit CSAT Feedback
async function submitCSATFeedback(feedback) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/csat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId
            },
            body: JSON.stringify({ message: feedback })
        });
        
        const data = await response.json();
        csatContent.innerHTML = `
            <p style="color: var(--yellow-primary); text-align: center; padding: 2rem;">
                ${data.response.message}
            </p>
        `;
        
        setTimeout(() => {
            csatModal.classList.remove('active');
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Add Message to Chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🤖';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Check if message contains OTP and format it specially
    if (content.includes('🔑 Your OTP is:')) {
        const parts = content.split('🔑 Your OTP is:');
        messageContent.innerHTML = parts[0] + '<div style="margin-top: 1rem; padding: 1rem; background: rgba(255, 215, 0, 0.2); border: 2px solid var(--yellow-primary); border-radius: 8px; text-align: center;"><div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">🔑 Your OTP is:</div><div style="font-size: 2rem; font-weight: 700; color: var(--yellow-primary); letter-spacing: 0.5rem; font-family: monospace;">' + parts[1].replace(/\*\*/g, '').trim() + '</div></div>';
    } else {
        // Regular message - preserve line breaks
        messageContent.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Set Input Disabled State
function setInputDisabled(disabled) {
    isWaitingForResponse = disabled;
    messageInput.disabled = disabled;
    sendButton.disabled = disabled;
    
    if (disabled) {
        sendButton.innerHTML = '<div class="loading"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
    } else {
        sendButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
        `;
    }
}
