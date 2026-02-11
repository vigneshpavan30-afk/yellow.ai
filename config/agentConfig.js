/**
 * Configuration for the Banking Agent
 */

export const AGENT_CONFIG = {
  name: "Yellow Bank Banking Agent",
  language: "en",
  maxOTPAttempts: 3,
  supportedOTPs: ["1234", "5678", "7889", "1209"],
  
  // Conversation states
  states: {
    IDLE: "idle",
    INTENT_RECOGNIZED: "intent_recognized",
    COLLECTING_PHONE: "collecting_phone",
    COLLECTING_DOB: "collecting_dob",
    OTP_TRIGGERED: "otp_triggered",
    OTP_VERIFYING: "otp_verifying",
    OTP_VERIFIED: "otp_verified",
    LOAN_ACCOUNTS_DISPLAYED: "loan_accounts_displayed",
    LOAN_DETAILS_DISPLAYED: "loan_details_displayed",
    CSAT_SURVEY: "csat_survey"
  },
  
  // API endpoints
  endpoints: {
    triggerOTP: "/api/workflows/triggerOTP",
    getLoanAccounts: "/api/workflows/getLoanAccounts",
    loanDetails: "/api/workflows/loanDetails",
    csat: "/api/csat"
  }
};
