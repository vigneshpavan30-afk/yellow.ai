/**
 * Loan Details Workflow
 * Returns detailed loan information for a specific account
 */

import { optimizeLoanDetailsResponse } from '../utils/tokenOptimizer.js';

/**
 * Mock API that returns detailed loan information
 */
async function mockLoanDetailsAPI(loanAccountId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Mock detailed loan data
  const loanDetailsMap = {
    "LOAN001234": {
      loanAccountId: "LOAN001234",
      tenure: 240,
      interest_rate: 8.5,
      principal_pending: 7200000,
      interest_pending: 1300000,
      nominee: "John Doe",
      typeOfLoan: "Home Loan"
    },
    "LOAN005678": {
      loanAccountId: "LOAN005678",
      tenure: 36,
      interest_rate: 12.0,
      principal_pending: 380000,
      interest_pending: 70000,
      nominee: "Jane Smith",
      typeOfLoan: "Personal Loan"
    },
    "LOAN009012": {
      loanAccountId: "LOAN009012",
      tenure: 60,
      interest_rate: 9.5,
      principal_pending: 1050000,
      interest_pending: 150000,
      nominee: "Robert Johnson",
      typeOfLoan: "Car Loan"
    }
  };

  const details = loanDetailsMap[loanAccountId];
  
  if (!details) {
    throw new Error("Loan account not found");
  }

  return {
    success: true,
    ...details
  };
}

/**
 * Get Loan Details Workflow
 * @param {string} loanAccountId - Selected loan account ID
 * @returns {Promise<Object>} - Loan details response
 */
export async function loanDetailsWorkflow(loanAccountId) {
  try {
    if (!loanAccountId) {
      throw new Error("Loan Account ID is required");
    }

    // Call mock API
    const fullResponse = await mockLoanDetailsAPI(loanAccountId);

    // Optimize response (though this one is already minimal)
    const optimizedResponse = optimizeLoanDetailsResponse(fullResponse);

    return {
      success: true,
      data: optimizedResponse,
      message: "Loan details retrieved successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to retrieve loan details"
    };
  }
}
