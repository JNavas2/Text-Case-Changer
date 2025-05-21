/**
 * POPUP.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * USED ON ANDROID INSTEAD OF CONTEXT SUBMENU
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

// Attach click listeners to each button
caseTypes.forEach(caseType => {
  const btn = document.getElementById(caseType);
  if (btn) {
    btn.addEventListener("click", () => {
      browser.runtime.sendMessage({
        action: "popupCaseChange",
        caseType: caseType
      }).then(() => {
        // Optional: provide feedback to user
        const feedback = document.getElementById("feedback");
        if (feedback) {
          feedback.textContent = "Case changed!";
          setTimeout(() => feedback.textContent = "", 1000);
        }
      }).catch(err => {
        console.error("Failed to send message to background:", err);
      });
    });
  }
});
