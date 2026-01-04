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

// THE GATEKEEPER: Consolidated permission check
async function checkAccessAndSend(tabId, message) {
  const hasAccess = await chrome.permissions.contains({ origins: ["<all_urls>"] });
  if (!hasAccess) {
    chrome.tabs.create({ url: chrome.runtime.getURL("request.html") });
    return;
  }
  chrome.tabs.sendMessage(tabId, message);
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
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
    if (tab && tab.id) checkAccessAndSend(tab.id, { action: "changeCase", caseType: caseType });
  }
});

chrome.commands.onCommand.addListener((command) => {
  const validCases = ["lowerCase", "upperCase", "invertCase", "sentenceCase", "startCase", "titleCase", "camelCase", "snakeCase"];
  if (validCases.includes(command)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) checkAccessAndSend(tabs[0].id, { action: "changeCase", caseType: command });
    });
  }
});