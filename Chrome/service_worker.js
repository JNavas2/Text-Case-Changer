/**
 * SERVICE_WORKER.JS of TEXT CASE CHANGER, an EXTENSION for GOOGLE CHROME
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Helper function to create context menus
function createContextMenus() {
  // Parent context menu
  chrome.contextMenus.create({
    id: "text-case-changer",
    title: "Text Case Changer",
    contexts: ["selection", "editable"],
  });

  // Submenu items
  const cases = [
    { id: "lowerCase",    title: "lower case" },
    { id: "upperCase",    title: "UPPER CASE" },
    { id: "invertCase",   title: "Invert cASE" },
    { id: "sentenceCase", title: "Sentence Case." },
    { id: "startCase",    title: "Start Case" },
    { id: "titleCase",    title: "Title Case" },
    { id: "camelCase",    title: "camelCase" },
    { id: "snakeCase",    title: "snake_case" },
  ];

  cases.forEach((item) => {
    chrome.contextMenus.create({
      id: `text-case-changer-${item.id}`,
      parentId: "text-case-changer",
      title: item.title,
      contexts: ["selection", "editable"]
    });
    // Insert separator after titleCase
    if (item.id === "titleCase") {
      chrome.contextMenus.create({
        id: "text-case-changer-separator-1",
        parentId: "text-case-changer",
        type: "separator",
        contexts: ["selection", "editable"]
      });
    }
  });

  // Insert separator at the bottom
  chrome.contextMenus.create({
    id: "text-case-changer-separator-bottom",
    parentId: "text-case-changer",
    type: "separator",
    contexts: ["selection", "editable"]
  });

  // Add "Edit Shortcuts" entry at the bottom
  chrome.contextMenus.create({
    id: "text-case-changer-edit-shortcuts",
    parentId: "text-case-changer",
    title: "Edit Shortcuts",
    contexts: ["selection", "editable"],
    // icons: { "16": "images/shortcuts-16.png" } // Uncomment if you have this icon
  });
}

// Onboarding/Upboarding welcome with Remove button
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("onboarding.html")
    });
  }
  // Always clear and recreate context menus on install/update
  chrome.contextMenus.removeAll(() => createContextMenus());
});

// Also clear and recreate context menus at startup (for extension reloads)
chrome.runtime.onStartup.addListener(() => {
  chrome.contextMenus.removeAll(() => createContextMenus());
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const prefix = "text-case-changer-";
  if (info.menuItemId === "text-case-changer-edit-shortcuts") {
    // Open Chrome shortcut settings
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    return;
  }
  if (info.menuItemId.startsWith(prefix)) {
    const caseType = info.menuItemId.replace(prefix, "");
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "changeCase",
        caseType: caseType
      }, () => {
        if (chrome.runtime.lastError) {
          // Log error if content script is not available
          console.error("Failed to send menu message to content script:", chrome.runtime.lastError);
        }
      });
    }
  }
});

// Handle extension commands (keyboard shortcuts)
chrome.commands.onCommand.addListener((command) => {
  // Only handle valid case commands
  const validCases = [
    "lowerCase", "upperCase", "invertCase", "sentenceCase",
    "startCase", "titleCase", "camelCase", "snakeCase"
  ];
  if (validCases.includes(command)) {
    // Get the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "changeCase",
          caseType: command
        }, () => {
          if (chrome.runtime.lastError) {
            // Log error if content script is not available
            console.error("Failed to send command message to content script:", chrome.runtime.lastError);
          }
        });
      }
    });
  }
});
