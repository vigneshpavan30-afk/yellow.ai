/**
 * Token Optimization Middleware
 * Filters API responses to only include necessary fields for LLM processing
 * This prevents token waste and reduces hallucination risks
 */

/**
 * Optimizes getLoanAccounts response by extracting only required fields
 * @param {Object} fullResponse - Complete API response with all fields
 * @returns {Object} - Optimized response with only: Loan Account ID, Type of Loan, Tenure
 */
export function optimizeLoanAccountsResponse(fullResponse) {
  if (!fullResponse || !fullResponse.accounts || !Array.isArray(fullResponse.accounts)) {
    return { accounts: [] };
  }

  const optimizedAccounts = fullResponse.accounts.map(account => ({
    loanAccountId: account.loanAccountId || account.loan_account_id || account.id,
    typeOfLoan: account.typeOfLoan || account.type_of_loan || account.loanType || account.loan_type,
    tenure: account.tenure || account.tenure_months || account.tenureMonths
  }));

  return {
    accounts: optimizedAccounts,
    count: optimizedAccounts.length
  };
}

/**
 * Middleware instruction for LLM to process loan accounts
 * This is the "Middle-man Instruction" that tells the LLM what to extract
 */
export const LOAN_ACCOUNTS_PROJECTION = {
  instruction: `When processing loan accounts data, extract ONLY the following fields:
- loanAccountId: The unique identifier for the loan account
- typeOfLoan: The type/category of the loan
- tenure: The loan tenure period

Ignore all other fields such as:
- Internal bank codes
- Audit dates
- Transaction histories
- Internal references
- Metadata
- Any other fields not listed above

Use only the extracted fields to create the Dynamic Rich Media cards.`,
  requiredFields: ["loanAccountId", "typeOfLoan", "tenure"]
};

/**
 * Optimizes loan details response
 * @param {Object} fullResponse - Complete API response
 * @returns {Object} - Optimized response with only customer-facing fields
 */
export function optimizeLoanDetailsResponse(fullResponse) {
  return {
    loanAccountId: fullResponse.loanAccountId || fullResponse.loan_account_id,
    tenure: fullResponse.tenure || fullResponse.tenure_months,
    interestRate: fullResponse.interest_rate || fullResponse.interestRate,
    principalPending: fullResponse.principal_pending || fullResponse.principalPending,
    interestPending: fullResponse.interest_pending || fullResponse.interestPending,
    nominee: fullResponse.nominee || fullResponse.nominee_name
  };
}
