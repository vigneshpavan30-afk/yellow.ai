/**
 * CSAT (Customer Satisfaction) Agent
 * Collects ratings and feedback from users
 */

export class CSATAgent {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.state = "collecting_rating";
    this.rating = null;
    this.feedback = null;
  }

  /**
   * Processes CSAT survey message
   * @param {string} userMessage - User's input
   * @returns {Object} - Agent response
   */
  processMessage(userMessage) {
    const lowerMessage = userMessage.toLowerCase().trim();

    if (this.state === "collecting_rating") {
      return this.handleRatingCollection(lowerMessage);
    } else if (this.state === "collecting_feedback") {
      return this.handleFeedbackCollection(userMessage);
    }

    return {
      message: "Thank you for your feedback!",
      state: "completed",
      type: "text"
    };
  }

  /**
   * Handles rating collection
   */
  handleRatingCollection(message) {
    const ratingMap = {
      "good": "good",
      "excellent": "good",
      "great": "good",
      "average": "average",
      "ok": "average",
      "okay": "average",
      "bad": "bad",
      "poor": "bad",
      "terrible": "bad"
    };

    // Check for numeric ratings (1-5 scale)
    const numericMatch = message.match(/\b([1-5])\b/);
    if (numericMatch) {
      const num = parseInt(numericMatch[1]);
      if (num >= 4) this.rating = "good";
      else if (num === 3) this.rating = "average";
      else this.rating = "bad";
    } else {
      // Check for text-based ratings
      for (const [key, value] of Object.entries(ratingMap)) {
        if (message.includes(key)) {
          this.rating = value;
          break;
        }
      }
    }

    if (this.rating) {
      this.state = "collecting_feedback";
      return {
        message: `Thank you for rating us as "${this.rating.toUpperCase()}"! Would you like to share any additional feedback? (You can type your feedback or say "Skip" to finish)`,
        state: this.state,
        type: "text",
        rating: this.rating
      };
    }

    return {
      message: "Please rate your experience: Good, Average, or Bad. (You can also use a number from 1-5, where 5 is Good and 1 is Bad)",
      state: this.state,
      type: "text"
    };
  }

  /**
   * Handles feedback collection
   */
  handleFeedbackCollection(message) {
    if (message.toLowerCase().includes("skip") || message.toLowerCase().includes("no")) {
      this.feedback = null;
      this.state = "completed";
      return {
        message: "Thank you for your feedback! We appreciate your time. Is there anything else I can help you with?",
        state: this.state,
        type: "text",
        rating: this.rating,
        feedback: null
      };
    }

    this.feedback = message;
    this.state = "completed";
    
    return {
      message: "Thank you for your detailed feedback! We truly appreciate it. Is there anything else I can help you with?",
      state: this.state,
      type: "text",
      rating: this.rating,
      feedback: this.feedback
    };
  }

  /**
   * Get CSAT results
   */
  getResults() {
    return {
      rating: this.rating,
      feedback: this.feedback,
      completed: this.state === "completed"
    };
  }

  /**
   * Reset agent
   */
  reset() {
    this.state = "collecting_rating";
    this.rating = null;
    this.feedback = null;
  }
}
