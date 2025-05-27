/**
 * POPUP.JS of TEXT CASE CHANGER, for Android Firefox popup
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// List of case types matching your background/content script
const caseTypes = [
  "lowerCase",
  "upperCase",
  "invertCase",
  "sentenceCase",
  "startCase",
  "titleCase",
  "camelCase",
  "snakeCase"
];

// Optional: feedback element for user notification
const feedback = document.getElementById("feedback");

function showFeedback(msg, duration = 1200) {
  if (feedback) {
    feedback.textContent = msg;
    setTimeout(() => { feedback.textContent = ""; }, duration);
  }
}

// Attach click listeners to each button
caseTypes.forEach(caseType => {
  const btn = document.getElementById(caseType);
  if (btn) {
    btn.addEventListener("click", () => {
      browser.runtime.sendMessage({
        action: "popupCaseChange",
        caseType: caseType
      }).then(() => {
        // Try to close the popup (works on desktop and most recent Android)
        window.close();
      }).catch(err => {
        // Show feedback if message fails
        showFeedback("Failed to change case.");
        console.error("Failed to send message to background:", err);
      });
    });
  }
});
