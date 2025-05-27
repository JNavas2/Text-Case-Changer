/**
 * BACKGROUND.JS of TEXT CASE CHANGER, EXTENSION for MOZILLA FIREFOX
 * SUPPORTS BOTH DESKTOP AND ANDROID, CROSS-PLATFORM ROBUST VERSION
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// 1. Onboarding Page (always run)
browser.runtime.onInstalled.addListener((details) => {
  console.log("[background] onInstalled:", details);
  if (details.reason === "install" || details.reason === "update") {
    const url = browser.runtime.getURL("onboarding.html");
    console.log("[background] Opening onboarding page:", url);
    browser.tabs.create({ url });
  }
});

// 2. Context Menus (desktop only)
if (browser.contextMenus) {
  function createContextMenus() {
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

  // Register listeners ONCE, outside the function to avoid duplicates
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.removeAll().then(createContextMenus);
  });

  browser.runtime.onStartup.addListener(() => {
    browser.contextMenus.removeAll().then(createContextMenus);
  });

  // Register context menu click handler at top level
  browser.contextMenus.onClicked.addListener((info, tab) => {
    // Handle "Edit Shortcuts" menu item
    if (info.menuItemId === "text-case-changer-edit-shortcuts") {
      // Open Firefox shortcut settings if available, else fallback
      if (browser.commands && browser.commands.openShortcutSettings) {
        browser.commands.openShortcutSettings();
      } else {
        // Fallback: open about:addons (not as direct, but helpful)
        browser.tabs.create({ url: "about:addons", windowId: tab && tab.windowId });
      }
      return;
    }

    // Handle case change menu items
    const prefix = "text-case-changer-";
    if (info.menuItemId.startsWith(prefix)) {
      const caseType = info.menuItemId.replace(prefix, "");
      if (tab && tab.id) {
        browser.tabs.sendMessage(tab.id, {
          action: "changeCase",
          caseType: caseType
        }).catch(e => {
          console.error("[background] Failed to send menu message to content script:", e);
        });
      } else {
        console.warn("[background] No tab.id in context menu click!");
      }
    }
  });
}

// 3. Commands API (desktop only)
if (browser.commands && browser.commands.onCommand) {
  browser.commands.onCommand.addListener((command) => {
    const validCases = [
      "lowerCase", "upperCase", "invertCase", "sentenceCase",
      "startCase", "titleCase", "camelCase", "snakeCase"
    ];
    if (validCases.includes(command)) {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0] && tabs[0].id) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: "changeCase",
            caseType: command
          }).catch(e => {
            console.error("[background] Failed to send command message to content script:", e);
          });
        } else {
          console.warn("[background] No active tab found for command!");
        }
      });
    }
  });
}

// 4. Popup/Message Handling (works on both desktop and Android)
browser.runtime.onMessage.addListener((message, sender) => {
  if (message && message.action === "popupCaseChange" && message.caseType) {
    // Use lastFocusedWindow for best Android compatibility
    return browser.tabs.query({ lastFocusedWindow: true }).then((tabs) => {
      const candidate = tabs.find(tab => tab.active) || tabs[0];
      if (candidate && candidate.id) {
        return browser.tabs.sendMessage(candidate.id, {
          action: "changeCase",
          caseType: message.caseType
        }).catch(e => {
          console.error("[background] Failed to send popup message to content script:", e);
        });
      } else {
        console.warn("[background] No suitable tab found for popup action!");
      }
    });
  }
});
