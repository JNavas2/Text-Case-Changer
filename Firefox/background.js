/**
 * BACKGROUND.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Helper function to create context menus
function createContextMenus() {
  // Create the parent context menu for editable selections
  browser.contextMenus.create({
    id: "text-case-changer",
    title: "Text Case Changer",
    contexts: ["selection", "editable"],
  });
  // Submenu items: case functions with shortcuts in titles
  const cases = [
    { id: "lowerCase", title: "lower case", icon: "images/lowercase-16.png" },
    { id: "upperCase", title: "UPPER CASE", icon: "images/uppercase-16.png" },
    { id: "invertCase", title: "Invert cASE", icon: "images/invertcase-16.png" },
    { id: "sentenceCase", title: "Sentence Case.", icon: "images/sentencecase-16.png" },
    { id: "startCase", title: "Start Case", icon: "images/startcase-16.png" },
    { id: "titleCase", title: "Title Case", icon: "images/titlecase-16.png" },
    // Insert separator after this
    { id: "camelCase", title: "camelCase", icon: "images/camelcase-16.png" },
    { id: "snakeCase", title: "snake_case", icon: "images/snakecase-16.png" },
  ];
  cases.forEach((item) => {
    browser.contextMenus.create({
      id: `text-case-changer-${item.id}`,
      parentId: "text-case-changer",
      title: item.title,
      contexts: ["selection", "editable"],
      icons: { "16": item.icon }
    });
    // Insert separator after titleCase
    if (item.id === "titleCase") {
      browser.contextMenus.create({
        id: "text-case-changer-separator-1",
        parentId: "text-case-changer",
        type: "separator",
        contexts: ["selection", "editable"]
      });
    }
  });
  // Insert separator at the bottom
  browser.contextMenus.create({
    id: "text-case-changer-separator-bottom",
    parentId: "text-case-changer",
    type: "separator",
    contexts: ["selection", "editable"]
  });
  // Add "Edit Shortcuts" entry at the bottom
  browser.contextMenus.create({
    id: "text-case-changer-edit-shortcuts",
    parentId: "text-case-changer",
    title: "Edit Shortcuts",
    contexts: ["selection", "editable"],
    // Optionally, you can add an icon for this entry
    // icons: { "16": "images/shortcuts-16.png" }
  });
}

// Onboarding/Upboarding welcome with Remove button
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    browser.tabs.create({
      url: browser.runtime.getURL("onboarding.html")
    });
  }
  // Always clear and recreate context menus on install/update
  browser.contextMenus.removeAll().then(createContextMenus);
});

// Also clear and recreate context menus at startup (for extension reloads)
browser.runtime.onStartup.addListener(() => {
  browser.contextMenus.removeAll().then(createContextMenus);
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  const prefix = "text-case-changer-";
  if (info.menuItemId === "text-case-changer-edit-shortcuts") {
    // Open Firefox shortcut settings
    if (browser.commands && browser.commands.openShortcutSettings) {
      browser.commands.openShortcutSettings();
    } else {
      // Fallback: open about:addons (not as direct, but helpful)
      browser.tabs.create({ url: "about:addons" });
    }
    return;
  }
  if (info.menuItemId.startsWith(prefix)) {
    const caseType = info.menuItemId.replace(prefix, "");
    if (tab && tab.id) {
      browser.tabs.sendMessage(tab.id, {
        action: "changeCase",
        caseType: caseType
      }).catch(e => {
        // Log error if content script is not available
        console.error("Failed to send menu message to content script:", e);
      });
    }
  }
});

// Handle extension commands (keyboard shortcuts)
browser.commands.onCommand.addListener((command) => {
  // Only handle valid case commands
  const validCases = [
    "lowerCase", "upperCase", "invertCase", "sentenceCase",
    "startCase", "titleCase", "camelCase", "snakeCase"
  ];
  if (validCases.includes(command)) {
    // Get the active tab in the current window
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0] && tabs[0].id) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: "changeCase",
          caseType: command
        }).catch(e => {
          // Log error if content script is not available
          console.error("Failed to send command message to content script:", e);
        });
      }
    });
  }
});
