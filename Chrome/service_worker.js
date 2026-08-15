/**
 * SERVICE_WORKER.JS of TEXT CASE CHANGER
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

function getShortcutsURL() {
  return navigator.userAgent.includes("Edg/") ? "edge://extensions/shortcuts" : "chrome://extensions/shortcuts";
}

function createContextMenus() {
  chrome.contextMenus.create({ id: "text-case-changer", title: "Text Case Changer", contexts: ["selection", "editable"] });
  const cases = [
    { id: "lowerCase", title: "lower case" }, { id: "upperCase", title: "UPPER CASE" },
    { id: "invertCase", title: "Invert cASE" }, { id: "sentenceCase", title: "Sentence Case." },
    { id: "startCase", title: "Start Case" }, { id: "titleCase", title: "Title Case" },
    { id: "camelCase", title: "camelCase" }, { id: "snakeCase", title: "snake_case" }
  ];
  cases.forEach((item) => {
    chrome.contextMenus.create({ id: `text-case-changer-${item.id}`, parentId: "text-case-changer", title: item.title, contexts: ["selection", "editable"] });
    if (item.id === "titleCase") chrome.contextMenus.create({ id: "text-case-changer-separator-1", parentId: "text-case-changer", type: "separator", contexts: ["selection", "editable"] });
  });
  chrome.contextMenus.create({ id: "text-case-changer-separator-bottom", parentId: "text-case-changer", type: "separator", contexts: ["selection", "editable"] });
  chrome.contextMenus.create({ id: "text-case-changer-edit-shortcuts", parentId: "text-case-changer", title: "Edit Shortcuts", contexts: ["selection", "editable"] });
}

// Programmatically injects content.js via activeTab without needing content.js structural changes
async function injectAndSendMessage(tabId, caseType) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => typeof window.textCaseChangerInitialized !== 'undefined'
    });

    if (!result || !result.result) {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => { window.textCaseChangerInitialized = true; }
      });
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      });
    }

    chrome.tabs.sendMessage(tabId, { action: "changeCase", caseType: caseType });
  } catch (err) {
    console.error("[service_worker] Injection or message failed:", err);
  }
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    let isPatchOnly = false;

    if (details.reason === "update" && details.previousVersion) {
      const currentVersion = chrome.runtime.getManifest().version;
      const prevParts = details.previousVersion.split(".");
      const currParts = currentVersion.split(".");

      if (prevParts[0] === currParts[0] && prevParts[1] === currParts[1]) {
        isPatchOnly = true;
      }
    }

    if (!isPatchOnly) {
      chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
    }
  }

  chrome.contextMenus.removeAll(() => createContextMenus());
});

chrome.runtime.onStartup.addListener(() => { chrome.contextMenus.removeAll(() => createContextMenus()); });

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const prefix = "text-case-changer-";
  if (info.menuItemId === "text-case-changer-edit-shortcuts") {
    chrome.tabs.create({ url: getShortcutsURL() });
    return;
  }
  if (info.menuItemId.startsWith(prefix)) {
    const caseType = info.menuItemId.replace(prefix, "");
    if (tab && tab.id) {
      injectAndSendMessage(tab.id, caseType);
    }
  }
});

chrome.commands.onCommand.addListener((command) => {
  const validCases = ["lowerCase", "upperCase", "invertCase", "sentenceCase", "startCase", "titleCase", "camelCase", "snakeCase"];
  if (validCases.includes(command)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        injectAndSendMessage(tabs[0].id, command);
      }
    });
  }
});
