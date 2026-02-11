/**
 * OTP Trigger Workflow
 * Generates a mock OTP (one of: 1234, 5678, 7889, or 1209)
 */

import { AGENT_CONFIG } from '../config/agentConfig.js';

/**
 * Triggers OTP generation workflow
 * @param {string} phoneNumber - User's phone number
 * @param {string} dob - User's date of birth
 * @returns {Promise<Object>} - OTP response
 */
export async function triggerOTPWorkflow(phoneNumber, dob) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Validate inputs
  if (!phoneNumber || !dob) {
    throw new Error("Phone number and DOB are required");
  }

  // Mock OTP API - returns one of the predetermined values
  const otpValues = AGENT_CONFIG.supportedOTPs;
  const randomOTP = otpValues[Math.floor(Math.random() * otpValues.length)];

  return {
    success: true,
    otp: randomOTP,
    message: "OTP generated successfully",
    phoneNumber: phoneNumber, // For verification purposes
    expiresIn: 300 // 5 minutes in seconds
  };
}

/**
 * Verifies the OTP
 * @param {string} phoneNumber - User's phone number
 * @param {string} submittedOTP - OTP submitted by user
 * @param {string} generatedOTP - OTP that was generated
 * @returns {Object} - Verification result
 */
export function verifyOTP(phoneNumber, submittedOTP, generatedOTP) {
  if (!submittedOTP || !generatedOTP) {
    return {
      success: false,
      message: "OTP verification failed: Missing OTP"
    };
  }

  if (submittedOTP.trim() === generatedOTP.trim()) {
    return {
      success: true,
      message: "OTP verified successfully"
    };
  }

  return {
    success: false,
    message: "Invalid OTP. Please try again."
  };
}
