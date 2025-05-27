// BACKGROUND.JS of TEXT CASE CHANGER, cross-platform robust version

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
    const cases = [
      { id: "lowerCase", title: "lower case" },
      { id: "upperCase", title: "UPPER CASE" },
      { id: "invertCase", title: "Invert cASE" },
      { id: "sentenceCase", title: "Sentence Case." },
      { id: "startCase", title: "Start Case" },
      { id: "titleCase", title: "Title Case" },
      { id: "camelCase", title: "camelCase" },
      { id: "snakeCase", title: "snake_case" },
    ];
    cases.forEach((item) => {
      browser.contextMenus.create({
        id: `text-case-changer-${item.id}`,
        parentId: "text-case-changer",
        title: item.title,
        contexts: ["selection", "editable"]
      });
    });
  }

  browser.runtime.onInstalled.addListener((details) => {
    browser.contextMenus.removeAll().then(createContextMenus);
  });

  browser.runtime.onStartup.addListener(() => {
    browser.contextMenus.removeAll().then(createContextMenus);
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
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
