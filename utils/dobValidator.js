/**
 * Date of Birth Validator
 * Validates DOB format and ensures it's a valid date
 */

/**
 * Validates a date of birth string in DD/MM/YYYY format
 * @param {string} dobString - Date string in DD/MM/YYYY format
 * @returns {Object} - { valid: boolean, error: string|null, date: Date|null }
 */
export function validateDOB(dobString) {
  if (!dobString || typeof dobString !== 'string') {
    return {
      valid: false,
      error: 'Date of birth is required',
      date: null
    };
  }

  // Check format: DD/MM/YYYY (strict - must be 2 digits for day and month, 4 digits for year)
  const dobPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dobString.trim().match(dobPattern);
  
  if (!match) {
    // Check if it's close but wrong format
    const loosePattern = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
    if (loosePattern.test(dobString.trim())) {
      return {
        valid: false,
        error: 'Invalid format. Please use DD/MM/YYYY format with 2 digits for day, 2 digits for month, and 4 digits for year (e.g., 22/02/2004, not 22/2/04)',
        date: null
      };
    }
    return {
      valid: false,
      error: 'Invalid format. Please use DD/MM/YYYY format (e.g., 15/06/1990)',
      date: null
    };
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Validate day range (1-31)
  if (day < 1 || day > 31) {
    return {
      valid: false,
      error: 'Invalid day. Day must be between 1 and 31',
      date: null
    };
  }

  // Validate month range (1-12)
  if (month < 1 || month > 12) {
    return {
      valid: false,
      error: 'Invalid month. Month must be between 1 and 12',
      date: null
    };
  }

  // Validate year range (reasonable birth years: 1900 to current year)
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear;

  if (year < minYear || year > maxYear) {
    return {
      valid: false,
      error: `Invalid year. Year must be between ${minYear} and ${maxYear}`,
      date: null
    };
  }

  // Check if the date is actually valid (handles cases like 31/02/1990)
  const date = new Date(year, month - 1, day);
  
  if (date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    return {
      valid: false,
      error: 'Invalid date. Please check the day, month, and year (e.g., 15/06/1990)',
      date: null
    };
  }

  // Check if date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (date > today) {
    return {
      valid: false,
      error: 'Date of birth cannot be in the future',
      date: null
    };
  }

  // Check if person is too old (more than 120 years)
  const age = currentYear - year;
  if (age > 120) {
    return {
      valid: false,
      error: 'Please enter a valid date of birth',
      date: null
    };
  }

  // Check if person is too young (less than 18 years for banking)
  if (age < 18) {
    return {
      valid: false,
      error: 'You must be at least 18 years old to use banking services',
      date: null
    };
  }

  // Format the date properly
  const formattedDOB = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

  return {
    valid: true,
    error: null,
    date: date,
    formatted: formattedDOB
  };
}

/**
 * Extracts and validates DOB from a message
 * @param {string} message - User message
 * @returns {Object} - { valid: boolean, dob: string|null, error: string|null }
 */
export function extractAndValidateDOB(message) {
  // Extract date pattern - prefer strict DD/MM/YYYY format
  // First try strict format (2 digits, 2 digits, 4 digits)
  const strictPattern = /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/;
  let match = message.match(strictPattern);
  
  if (match) {
    let day = match[1];
    let month = match[2];
    let year = match[3];
    
    const dobString = `${day}/${month}/${year}`;
    const validation = validateDOB(dobString);
    
    if (validation.valid) {
      return {
        valid: true,
        dob: validation.formatted,
        error: null
      };
    } else {
      return {
        valid: false,
        dob: null,
        error: validation.error
      };
    }
  }
  
  // If strict format not found, check for loose format and reject with helpful error
  const loosePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  match = message.match(loosePattern);
  
  if (match) {
    // Found date but wrong format - provide specific error
    return {
      valid: false,
      dob: null,
      error: 'Invalid format. Please use DD/MM/YYYY format with 2 digits for day, 2 digits for month, and 4 digits for year (e.g., 22/02/2004, not 22/2/04)'
    };
  }

  return {
    valid: false,
    dob: null,
    error: 'No valid date found. Please provide your date of birth in DD/MM/YYYY format (e.g., 15/06/1990)'
  };
}
