/**
 * ONBOARDING.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * SUPPORTS BOTH DESKTOP AND ANDROID
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

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

  // Replace the {version} and {changes} fields in the WHAT'S NEW line
  const versionElem = document.getElementById('whatsNewVersion');
  const changesElem = document.getElementById('whatsNewChanges');
  if (versionElem && changesElem) {
    Promise.all([
      fetch(browser.runtime.getURL('manifest.json')).then(r => r.json()),
      fetch(browser.runtime.getURL('whats_new.json')).then(r => r.json())
    ]).then(([manifest, whatsNew]) => {
      const version = manifest.version || '';
      const changes = Array.isArray(whatsNew.changes)
        ? whatsNew.changes.join('; ')
        : (whatsNew.changes || '');
      if (version) versionElem.textContent = version;
      if (changes) changesElem.textContent = changes;
    }).catch(() => {
      // If fetch fails, leave the dummy placeholders
    });
  }
});
