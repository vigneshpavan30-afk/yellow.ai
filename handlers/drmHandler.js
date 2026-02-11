/**
 * Dynamic Rich Media (DRM) Handler
 * Creates interactive cards and quick replies for loan accounts and details
 */

/**
 * Creates DRM cards for loan accounts
 * @param {Array} accounts - Array of loan account objects
 * @returns {Object} - DRM card structure
 */
export function createLoanAccountsDRM(accounts) {
  if (!accounts || accounts.length === 0) {
    return {
      type: "text",
      message: "No loan accounts found."
    };
  }

  const cards = accounts.map(account => ({
    type: "card",
    title: `${account.typeOfLoan} - ${account.loanAccountId}`,
    description: `Tenure: ${account.tenure} months`,
    buttons: [
      {
        type: "select",
        label: "View Details",
        message: account.loanAccountId // Account ID included in message for selection
      }
    ]
  }));

  return {
    type: "carousel",
    message: "Please select a loan account to view details:",
    cards: cards
  };
}

/**
 * Creates DRM quick replies for loan details
 * @param {Object} loanDetails - Loan details object
 * @returns {Object} - DRM quick replies structure
 */
export function createLoanDetailsDRM(loanDetails) {
  const details = [
    `Loan Account ID: ${loanDetails.loanAccountId}`,
    `Tenure: ${loanDetails.tenure} months`,
    `Interest Rate: ${loanDetails.interestRate}%`,
    `Principal Pending: ₹${loanDetails.principalPending.toLocaleString('en-IN')}`,
    `Interest Pending: ₹${loanDetails.interestPending.toLocaleString('en-IN')}`,
    `Nominee: ${loanDetails.nominee}`
  ].join("\n");

  return {
    type: "quick_replies",
    message: `Here are your loan account details:\n\n${details}`,
    quickReplies: [
      {
        type: "button",
        label: "Rate our chat",
        action: "csat_survey",
        message: "CSAT_SURVEY_TRIGGER"
      },
      {
        type: "button",
        label: "View Another Account",
        action: "back_to_accounts",
        message: "BACK_TO_ACCOUNTS"
      }
    ]
  };
}

/**
 * Formats loan details for display
 * @param {Object} loanDetails - Loan details object
 * @returns {string} - Formatted message
 */
export function formatLoanDetails(loanDetails) {
  return `Loan Account Details:

Account ID: ${loanDetails.loanAccountId}
Tenure: ${loanDetails.tenure} months
Interest Rate: ${loanDetails.interestRate}%
Principal Pending: ₹${loanDetails.principalPending.toLocaleString('en-IN')}
Interest Pending: ₹${loanDetails.interestPending.toLocaleString('en-IN')}
Nominee: ${loanDetails.nominee}`;
}
