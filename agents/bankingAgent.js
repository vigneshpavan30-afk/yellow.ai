/**
 * Main Banking Agent Logic
 * Handles conversation flow, state management, and workflow orchestration
 */

import { AGENT_CONFIG } from '../config/agentConfig.js';
import { SYSTEM_PROMPT } from '../config/systemPrompt.js';
import { requiresLanguageRestriction, getLanguageRestrictionMessage } from '../utils/languageDetector.js';
import { triggerOTPWorkflow, verifyOTP } from '../workflows/triggerOTP.js';
import { getLoanAccountsWorkflow } from '../workflows/getLoanAccounts.js';
import { loanDetailsWorkflow } from '../workflows/loanDetails.js';
import { createLoanAccountsDRM, createLoanDetailsDRM } from '../handlers/drmHandler.js';
import { generateStructuredResponse, detectIntent, extractData } from '../services/geminiService.js';
import { extractAndValidateDOB } from '../utils/dobValidator.js';

/**
 * Banking Agent Class
 * Manages conversation state and workflow execution
 */
export class BankingAgent {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.state = AGENT_CONFIG.states.IDLE;
    this.intent = null;
    this.phoneNumber = null;
    this.dob = null;
    this.generatedOTP = null;
    this.otpAttempts = 0;
    this.selectedLoanAccountId = null;
    this.conversationHistory = [];
  }

  /**
   * Processes user message and returns agent response
   * @param {string} userMessage - User's input message
   * @returns {Promise<Object>} - Agent response with message and metadata
   */
  async processMessage(userMessage) {
    // Language restriction check
    if (requiresLanguageRestriction(userMessage)) {
      return {
        message: getLanguageRestrictionMessage(),
        state: this.state,
        type: "text"
      };
    }

    // Add to conversation history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    // Handle phone number change mid-conversation
    if (this.shouldRestartAuthentication(userMessage)) {
      return this.handlePhoneNumberChange();
    }

    // Process based on current state
    let response;
    switch (this.state) {
      case AGENT_CONFIG.states.IDLE:
        response = await this.handleIdleState(userMessage);
        break;
      case AGENT_CONFIG.states.INTENT_RECOGNIZED:
        response = await this.handleIntentRecognized(userMessage);
        break;
      case AGENT_CONFIG.states.COLLECTING_PHONE:
        response = await this.handlePhoneCollection(userMessage);
        break;
      case AGENT_CONFIG.states.COLLECTING_DOB:
        response = await this.handleDOBCollection(userMessage);
        break;
      case AGENT_CONFIG.states.OTP_TRIGGERED:
        response = await this.handleOTPVerification(userMessage);
        break;
      case AGENT_CONFIG.states.OTP_VERIFIED:
        response = await this.handlePostOTPVerification(userMessage);
        break;
      case AGENT_CONFIG.states.LOAN_ACCOUNTS_DISPLAYED:
        response = await this.handleLoanAccountSelection(userMessage);
        break;
      case AGENT_CONFIG.states.LOAN_DETAILS_DISPLAYED:
        response = await this.handleLoanDetailsDisplayed(userMessage);
        break;
      default:
        // Check if it's a loan/bank details request even in default state
        const lowerMsg = userMessage.toLowerCase();
        const intentPhrases = [
          "loan details", "check my loan", "view loan", "show loan",
          "loan information", "my loan account", "bank details",
          "check bank", "bank account", "account details", "check account"
        ];
        
        if (intentPhrases.some(phrase => lowerMsg.includes(phrase))) {
          this.intent = "view_loan_details";
          this.state = AGENT_CONFIG.states.INTENT_RECOGNIZED;
          response = {
            message: "I'll help you view your loan details. To proceed, I need to verify your identity. Please provide your registered phone number.",
            state: this.state,
            type: "text"
          };
        } else {
          response = {
            message: "I'm here to help you with your loan details. You can say 'I want to check my loan details' or 'Show loan details' to get started.",
            state: this.state,
            type: "text"
          };
        }
    }

    // Add agent response to history
    this.conversationHistory.push({
      role: "assistant",
      content: response.message,
      timestamp: new Date().toISOString()
    });

    return response;
  }

  /**
   * Detects if user wants to restart authentication
   */
  shouldRestartAuthentication(message) {
    const lowerMessage = message.toLowerCase();
    const restartPhrases = [
      "wait, that's my old number",
      "that's my old number",
      "i want to check for a different number",
      "different number",
      "that's not my current number",
      "not my current number",
      "wrong number"
    ];

    return restartPhrases.some(phrase => lowerMessage.includes(phrase)) &&
           (this.state === AGENT_CONFIG.states.COLLECTING_DOB ||
            this.state === AGENT_CONFIG.states.OTP_TRIGGERED ||
            this.state === AGENT_CONFIG.states.OTP_VERIFIED ||
            this.state === AGENT_CONFIG.states.LOAN_ACCOUNTS_DISPLAYED);
  }

  /**
   * Handles phone number change mid-conversation
   */
  handlePhoneNumberChange() {
    // Clear authentication slots
    this.phoneNumber = null;
    this.dob = null;
    this.generatedOTP = null;
    this.otpAttempts = 0;
    
    // Retain intent
    this.intent = "view_loan_details";
    
    // Restart collection flow
    this.state = AGENT_CONFIG.states.COLLECTING_PHONE;
    
    return {
      message: "No problem! Let's start fresh. Please provide your registered phone number.",
      state: this.state,
      type: "text"
    };
  }

  /**
   * Handles idle state - detects intent using AI
   */
  async handleIdleState(message) {
    try {
      // Use rule-based detection for speed (loan details, bank details, account details all mean the same)
      const lowerMessage = message.toLowerCase();
      const intentPhrases = [
        "loan details",
        "check my loan",
        "view loan",
        "show loan",
        "loan information",
        "my loan account",
        "bank details",
        "check bank",
        "bank account",
        "account details",
        "check account"
      ];

      if (intentPhrases.some(phrase => lowerMessage.includes(phrase))) {
        this.intent = "view_loan_details";
        this.state = AGENT_CONFIG.states.INTENT_RECOGNIZED;
        
        return {
          message: "I'll help you view your loan details. To proceed, I need to verify your identity. Please provide your registered phone number.",
          state: this.state,
          type: "text"
        };
      }
      
      // For other intents, provide helpful guidance
      return {
        message: "I'm here to help you with your loan details. You can say 'I want to check my loan details' or 'Show loan details' to get started.",
        state: this.state,
        type: "text"
      };
    } catch (error) {
      console.error('AI intent detection error, using fallback:', error);
      // Fallback to rule-based detection
      const lowerMessage = message.toLowerCase();
      const intentPhrases = [
        "loan details",
        "check my loan",
        "view loan",
        "show loan",
        "loan information",
        "my loan account"
      ];

      if (intentPhrases.some(phrase => lowerMessage.includes(phrase))) {
        this.intent = "view_loan_details";
        this.state = AGENT_CONFIG.states.INTENT_RECOGNIZED;
        return {
          message: "I'll help you view your loan details. To proceed, I need to verify your identity. Please provide your registered phone number.",
          state: this.state,
          type: "text"
        };
      }

      return {
        message: "I'm here to help you with your loan details. You can say 'I want to check my loan details' or 'Show loan details' to get started.",
        state: this.state,
        type: "text"
      };
    }
  }

  /**
   * Handles intent recognized state
   */
  async handleIntentRecognized(message) {
    // Should transition to phone collection
    this.state = AGENT_CONFIG.states.COLLECTING_PHONE;
    return this.handlePhoneCollection(message);
  }

  /**
   * Handles phone number collection (optimized for speed)
   */
  async handlePhoneCollection(message) {
    // Check if user is trying to restart or change intent
    const lowerMessage = message.toLowerCase();
    const intentPhrases = [
      "loan details", "check my loan", "view loan", "show loan",
      "loan information", "my loan account", "bank details",
      "check bank", "bank account", "account details", "check account"
    ];
    
    // If user is requesting loan details again, restart the flow
    if (intentPhrases.some(phrase => lowerMessage.includes(phrase))) {
      this.intent = "view_loan_details";
      this.state = AGENT_CONFIG.states.COLLECTING_PHONE;
      return {
        message: "I'll help you view your loan details. To proceed, I need to verify your identity. Please provide your registered phone number.",
        state: this.state,
        type: "text"
      };
    }
    
    // Use regex extraction first (instant, no AI call)
    const phoneNumber = this.extractPhoneNumber(message);
    
    if (!phoneNumber) {
      // Return error immediately without AI call for faster response
      return {
        message: "Please provide a valid phone number (e.g., 9876543210 or +91-9876543210).",
        state: this.state,
        type: "text",
        validationError: true
      };
    }

    this.phoneNumber = phoneNumber;
    this.state = AGENT_CONFIG.states.COLLECTING_DOB;
    
    // Return standard response immediately (no AI call for faster response)
    return {
      message: "Thank you! Now, please provide your date of birth in DD/MM/YYYY format.",
      state: this.state,
      type: "text"
    };
  }

  /**
   * Handles DOB collection with validation
   */
  async handleDOBCollection(message) {
    // Extract and validate DOB using the validator (instant, no AI call needed)
    const dobResult = extractAndValidateDOB(message);
    
    if (!dobResult.valid) {
      // Return error immediately without AI call for faster response
      return {
        message: dobResult.error || "Please provide your date of birth in DD/MM/YYYY format (e.g., 15/06/1990).",
        state: this.state,
        type: "text",
        validationError: true
      };
    }

    // DOB is valid, proceed
    this.dob = dobResult.dob;
    
    // Trigger OTP workflow
    try {
      const otpResult = await triggerOTPWorkflow(this.phoneNumber, this.dob);
      this.generatedOTP = otpResult.otp;
      this.state = AGENT_CONFIG.states.OTP_TRIGGERED;
      
      // Create response message with OTP displayed
      const otpMessage = `An OTP has been sent to your registered phone number ${this.phoneNumber}. Please enter the OTP you received.\n\n🔑 Your OTP is: **${this.generatedOTP}**`;
      
      return {
        message: otpMessage,
        state: this.state,
        type: "text",
        metadata: {
          otpGenerated: true,
          otp: this.generatedOTP
        }
      };
    } catch (error) {
      return {
        message: "I'm experiencing a technical issue while generating the OTP. Please try again in a few moments.",
        state: this.state,
        type: "text",
        error: true
      };
    }
  }

  /**
   * Handles OTP verification
   */
  async handleOTPVerification(message) {
    const submittedOTP = this.extractOTP(message);
    
    if (!submittedOTP) {
      return {
        message: "Please provide the OTP you received.",
        state: this.state,
        type: "text"
      };
    }

    const verification = verifyOTP(this.phoneNumber, submittedOTP, this.generatedOTP);
    
    if (verification.success) {
      this.state = AGENT_CONFIG.states.OTP_VERIFIED;
      this.otpAttempts = 0;
      
      // Trigger getLoanAccounts workflow
      return await this.triggerLoanAccountsWorkflow();
    } else {
      this.otpAttempts++;
      
      if (this.otpAttempts >= AGENT_CONFIG.maxOTPAttempts) {
        return {
          message: "You've exceeded the maximum OTP attempts. Would you like to request a new OTP? (Yes/No)",
          state: this.state,
          type: "text"
        };
      }
      
      return {
        message: `Invalid OTP. Please try again. (Attempt ${this.otpAttempts}/${AGENT_CONFIG.maxOTPAttempts})`,
        state: this.state,
        type: "text"
      };
    }
  }

  /**
   * Handles post-OTP verification
   */
  async handlePostOTPVerification(message) {
    // Check if user wants to retry OTP
    if (message.toLowerCase().includes("yes") || message.toLowerCase().includes("new otp")) {
      return await this.handleDOBCollection(this.dob); // Retrigger OTP
    }
    
    // Otherwise, trigger loan accounts
    return await this.triggerLoanAccountsWorkflow();
  }

  /**
   * Triggers loan accounts workflow
   */
  async triggerLoanAccountsWorkflow() {
    try {
      const result = await getLoanAccountsWorkflow(this.phoneNumber);
      
      if (!result.success) {
        return {
          message: "I'm experiencing a technical issue retrieving your loan accounts. Please try again later.",
          state: this.state,
          type: "text",
          error: true
        };
      }

      const drm = createLoanAccountsDRM(result.data.accounts);
      this.state = AGENT_CONFIG.states.LOAN_ACCOUNTS_DISPLAYED;
      
      return {
        message: drm.message,
        state: this.state,
        type: "drm",
        drm: drm
      };
    } catch (error) {
      return {
        message: "I'm experiencing a technical issue. Please try again in a few moments.",
        state: this.state,
        type: "text",
        error: true
      };
    }
  }

  /**
   * Handles loan account selection
   */
  async handleLoanAccountSelection(message) {
    // Extract loan account ID from message (could be from button click or typed)
    const accountId = this.extractLoanAccountId(message);
    
    if (!accountId) {
      return {
        message: "Please select a loan account from the options above, or provide the loan account ID.",
        state: this.state,
        type: "text"
      };
    }

    this.selectedLoanAccountId = accountId;
    
    // Trigger loan details workflow
    try {
      const result = await loanDetailsWorkflow(accountId);
      
      if (!result.success) {
        return {
          message: "I'm experiencing a technical issue retrieving loan details. Please try again.",
          state: this.state,
          type: "text",
          error: true
        };
      }

      const drm = createLoanDetailsDRM(result.data);
      this.state = AGENT_CONFIG.states.LOAN_DETAILS_DISPLAYED;
      
      return {
        message: drm.message,
        state: this.state,
        type: "drm",
        drm: drm
      };
    } catch (error) {
      return {
        message: "I'm experiencing a technical issue. Please try again in a few moments.",
        state: this.state,
        type: "text",
        error: true
      };
    }
  }

  /**
   * Handles loan details displayed state
   */
  async handleLoanDetailsDisplayed(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for CSAT survey request
    if (message === "CSAT_SURVEY_TRIGGER" || lowerMessage.includes("rate")) {
      this.state = AGENT_CONFIG.states.CSAT_SURVEY;
      return {
        message: "Thank you for using our service! Please rate your experience.",
        state: this.state,
        type: "csat_redirect",
        redirectTo: "/api/csat"
      };
    }
    
    // Check for requests to view another loan account
    const anotherAccountPhrases = [
      "another account",
      "another loan",
      "view another",
      "see another",
      "different account",
      "different loan",
      "show accounts",
      "list accounts",
      "all accounts",
      "back to accounts"
    ];
    
    if (anotherAccountPhrases.some(phrase => lowerMessage.includes(phrase))) {
      // Reset selected account and show loan accounts again
      this.selectedLoanAccountId = null;
      return await this.triggerLoanAccountsWorkflow();
    }
    
    // Check if user provided a loan account ID directly
    const accountId = this.extractLoanAccountId(message);
    if (accountId) {
      return await this.handleLoanAccountSelection(message);
    }
    
    return {
      message: "Is there anything else I can help you with regarding your loan details?",
      state: this.state,
      type: "text"
    };
  }

  /**
   * Utility: Extract phone number from message
   */
  extractPhoneNumber(message) {
    // Remove common formatting
    const cleaned = message.replace(/[\s\-\(\)]/g, '');
    // Match phone numbers (10 digits or with country code)
    const match = cleaned.match(/(\+?\d{1,3})?(\d{10})/);
    return match ? match[0] : null;
  }

  /**
   * Utility: Extract DOB from message (uses validator for proper validation)
   */
  extractDOB(message) {
    const result = extractAndValidateDOB(message);
    return result.valid ? result.dob : null;
  }

  /**
   * Utility: Extract OTP from message
   */
  extractOTP(message) {
    // Match 4-digit OTP
    const match = message.match(/\b(\d{4})\b/);
    return match ? match[1] : null;
  }

  /**
   * Utility: Extract loan account ID from message
   */
  extractLoanAccountId(message) {
    // Match LOAN followed by digits
    const match = message.match(/LOAN\d+/);
    return match ? match[0] : null;
  }

  /**
   * Get current conversation state
   */
  getState() {
    return {
      state: this.state,
      intent: this.intent,
      phoneNumber: this.phoneNumber ? this.phoneNumber.replace(/\d(?=\d{4})/g, '*') : null, // Masked
      hasDOB: !!this.dob,
      otpAttempts: this.otpAttempts,
      selectedLoanAccountId: this.selectedLoanAccountId
    };
  }
}
