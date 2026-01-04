/**
 * ONBOARDING.JS of TEXT CASE CHANGER, an EXTENSION for GOOGLE CHROME and MICROSOFT EDGE
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Close: Closes the onboarding tab safely
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      chrome.tabs.getCurrent(tab => {
        if (tab) {
          chrome.tabs.remove(tab.id);
        } else {
          window.close(); // Fallback for mobile context
        }
      });
    });
  }

  // 2. Remove: Triggers native uninstallation
  const removeBtn = document.getElementById('removeBtn');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (chrome && chrome.management) {
        chrome.management.uninstallSelf({ showConfirmDialog: true });
      } else {
        alert('Unable to remove the extension programmatically.');
      }
    });
  }
});