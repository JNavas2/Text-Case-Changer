/**
 * ONBOARDING.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Handle "Remove Extension" button click
document.addEventListener('DOMContentLoaded', () => {
  const removeBtn = document.getElementById('removeBtn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      // Uninstall the extension programmatically
      if (browser && browser.management) {
        browser.management.uninstallSelf({ showConfirmDialog: true });
      } else {
        alert('Unable to remove the extension programmatically.');
      }
    });
  }
});
