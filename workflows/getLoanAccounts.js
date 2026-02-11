/**
 * Get Loan Accounts Workflow
 * Returns a list of loan accounts with token optimization
 */

import { optimizeLoanAccountsResponse } from '../utils/tokenOptimizer.js';

/**
 * Mock API that returns loan accounts with many unnecessary fields
 * This simulates a real API that returns excessive data
 */
async function mockLoanAccountsAPI(phoneNumber) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock response with 15+ fields (simulating real bank API)
  return {
    success: true,
    accounts: [
      {
        loanAccountId: "LOAN001234",
        typeOfLoan: "Home Loan",
        tenure: 240, // months
        // Unnecessary fields that will be filtered out
        internalBankCode: "YBL-HL-2024-001",
        auditDate: "2024-01-15T10:30:00Z",
        auditUserId: "SYSTEM_ADMIN_001",
        lastModifiedBy: "AUTO_PROCESSOR",
        lastModifiedDate: "2024-02-10T14:22:00Z",
        internalReference: "REF-YBL-789456123",
        branchCode: "BR-001",
        branchName: "Main Branch",
        accountStatus: "ACTIVE",
        riskCategory: "LOW",
        creditScore: 750,
        approvalDate: "2023-06-15",
        disbursementDate: "2023-06-20",
        emiAmount: 45000,
        totalOutstanding: 8500000,
        principalOutstanding: 7200000,
        interestOutstanding: 1300000,
        nextEMIDate: "2024-03-05",
        lastPaymentDate: "2024-02-05",
        paymentHistory: [],
        metadata: {
          systemVersion: "2.1.0",
          apiVersion: "v3",
          requestId: "req-123456789"
        }
      },
      {
        loanAccountId: "LOAN005678",
        typeOfLoan: "Personal Loan",
        tenure: 36,
        internalBankCode: "YBL-PL-2023-045",
        auditDate: "2024-01-20T09:15:00Z",
        auditUserId: "SYSTEM_ADMIN_002",
        lastModifiedBy: "MANUAL_UPDATE",
        lastModifiedDate: "2024-02-08T11:45:00Z",
        internalReference: "REF-YBL-456789321",
        branchCode: "BR-002",
        branchName: "Downtown Branch",
        accountStatus: "ACTIVE",
        riskCategory: "MEDIUM",
        creditScore: 680,
        approvalDate: "2023-09-10",
        disbursementDate: "2023-09-12",
        emiAmount: 15000,
        totalOutstanding: 450000,
        principalOutstanding: 380000,
        interestOutstanding: 70000,
        nextEMIDate: "2024-03-10",
        lastPaymentDate: "2024-02-10",
        paymentHistory: [],
        metadata: {
          systemVersion: "2.1.0",
          apiVersion: "v3",
          requestId: "req-987654321"
        }
      },
      {
        loanAccountId: "LOAN009012",
        typeOfLoan: "Car Loan",
        tenure: 60,
        internalBankCode: "YBL-CL-2023-078",
        auditDate: "2024-01-25T16:20:00Z",
        auditUserId: "SYSTEM_ADMIN_001",
        lastModifiedBy: "AUTO_PROCESSOR",
        lastModifiedDate: "2024-02-12T10:30:00Z",
        internalReference: "REF-YBL-321654987",
        branchCode: "BR-003",
        branchName: "Mall Road Branch",
        accountStatus: "ACTIVE",
        riskCategory: "LOW",
        creditScore: 720,
        approvalDate: "2023-11-05",
        disbursementDate: "2023-11-08",
        emiAmount: 25000,
        totalOutstanding: 1200000,
        principalOutstanding: 1050000,
        interestOutstanding: 150000,
        nextEMIDate: "2024-03-15",
        lastPaymentDate: "2024-02-15",
        paymentHistory: [],
        metadata: {
          systemVersion: "2.1.0",
          apiVersion: "v3",
          requestId: "req-456789123"
        }
      }
    ],
    totalCount: 3,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get Loan Accounts Workflow
 * Calls mock API and applies token optimization
 * @param {string} phoneNumber - User's verified phone number
 * @returns {Promise<Object>} - Optimized loan accounts response
 */
export async function getLoanAccountsWorkflow(phoneNumber) {
  try {
    // Call mock API (returns massive JSON with 15+ fields)
    const fullResponse = await mockLoanAccountsAPI(phoneNumber);

    // Apply token optimization - extract only needed fields
    const optimizedResponse = optimizeLoanAccountsResponse(fullResponse);

    return {
      success: true,
      data: optimizedResponse,
      message: "Loan accounts retrieved successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Failed to retrieve loan accounts"
    };
  }
}
