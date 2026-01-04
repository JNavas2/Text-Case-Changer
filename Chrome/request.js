/*
    request.js - Text Case Changer Extension (Chrome MV3)
    Permission bridge for optional_host_permissions
    © 2025 John Navas, All Rights Reserved
*/

document.getElementById('bGrant').addEventListener('click', () => {
    chrome.permissions.request({
        origins: ["<all_urls>"]
    }, (granted) => {
        if (granted) {
            document.getElementById('request-state').style.display = 'none';
            document.getElementById('success-state').style.display = 'block';
        }
    });
});

document.getElementById('bClose').addEventListener('click', () => {
    chrome.tabs.getCurrent(tab => {
        if (tab) {
            chrome.tabs.remove(tab.id);
        } else {
            window.close();
        }
    });
});