/**
 * Language Detection and Restriction
 * Ensures the agent only operates in English
 */

/**
 * Detects if the user message is in English
 * Simple heuristic-based detection (can be enhanced with proper NLP library)
 */
export function isEnglish(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // Remove common English banking terms and check for non-English characters
  const englishPattern = /^[a-zA-Z0-9\s.,!?'"()-]+$/;
  const hasNonEnglishChars = /[^\x00-\x7F]/;
  
  // Check for common non-English language indicators
  const nonEnglishPatterns = [
    /[\u0600-\u06FF]/, // Arabic
    /[\u4E00-\u9FFF]/, // Chinese
    /[\u3040-\u309F\u30A0-\u30FF]/, // Japanese
    /[\u0400-\u04FF]/, // Cyrillic
    /[\u0900-\u097F]/, // Devanagari (Hindi)
    /[\u0E00-\u0E7F]/  // Thai
  ];

  // If contains non-English script characters, likely not English
  for (const pattern of nonEnglishPatterns) {
    if (pattern.test(message)) {
      return false;
    }
  }

  // Basic check: if it matches English pattern and doesn't have non-English chars
  return englishPattern.test(message) || !hasNonEnglishChars.test(message);
}

/**
 * Generates a polite decline message for non-English requests
 */
export function getLanguageRestrictionMessage() {
  return "I apologize, but I am restricted to operating in English only. Please continue our conversation in English.";
}

/**
 * Checks if message contains intent to change language or is in non-English
 */
export function requiresLanguageRestriction(message) {
  if (!message) return false;
  
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit language change requests
  const languageChangePhrases = [
    "speak in",
    "talk in",
    "use",
    "in hindi",
    "in spanish",
    "in french",
    "in arabic",
    "हिंदी",
    "español",
    "français",
    "العربية"
  ];

  for (const phrase of languageChangePhrases) {
    if (lowerMessage.includes(phrase)) {
      return true;
    }
  }

  // Check if message is not in English
  return !isEnglish(message);
}
