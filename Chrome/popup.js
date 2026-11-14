/**
 * popup.js of TEXT CASE CHANGER
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.item').forEach(btn => {
        btn.addEventListener('click', () => {
            const caseType = btn.getAttribute('data-case');
            chrome.runtime.sendMessage({ action: "popupClick", caseType: caseType }, () => {
                window.close();
            });
        });
    });
});