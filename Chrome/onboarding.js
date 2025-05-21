/**
 * ONBOARDING.JS of TEXT CASE CHANGER, an EXTENSION for GOOGLE CHROME and MICROSOFT EDGE
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Handle "Remove Extension" button click
document.addEventListener('DOMContentLoaded', () => {
  const removeBtn = document.getElementById('removeBtn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      // Uninstall the extension programmatically
      if (chrome && chrome.management) {
        chrome.management.uninstallSelf({ showConfirmDialog: true });
      } else {
        alert('Unable to remove the extension programmatically.');
      }
    });
  }
});
