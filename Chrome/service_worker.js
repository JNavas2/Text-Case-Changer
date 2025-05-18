/**
 * SERVICE_WORKER.JS of TEXT CASE CHANGER, an EXTENSION for CHROME MANIFEST V3
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Onboarding/Upboarding welcome with Remove button
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("onboarding.html")
    });
  }
});

// Create the parent context menu for editable selections
chrome.contextMenus.create({
  id: "text-case-changer",
  title: "Text Case Changer",
  contexts: ["selection", "editable"],
});

// Submenu items: case functions with shortcuts in titles
const cases = [
  { id: "lowerCase",    title: "lower case (Ctrl+Shift+L)" },
  { id: "upperCase",    title: "UPPER CASE (Ctrl+Shift+U)" },
  { id: "invertCase",   title: "Invert cASE" },
  { id: "sentenceCase", title: "Sentence Case. (Ctrl+Shift+R)" },
  { id: "startCase",    title: "Start Case" },
  { id: "titleCase",    title: "Title Case (Ctrl+Shift+G)" },
  { id: "camelCase",    title: "camelCase" },
  { id: "snakeCase",    title: "snake_case" },
];

// Create submenu items
cases.forEach(item => {
  chrome.contextMenus.create({
    id: `text-case-changer-${item.id}`,
    parentId: "text-case-changer",
    title: item.title,
    contexts: ["selection", "editable"]
  });
});

// Handle menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const prefix = "text-case-changer-";
  if (info.menuItemId.startsWith(prefix)) {
    const caseType = info.menuItemId.replace(prefix, "");
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "changeCase",
        caseType: caseType
      });
    }
  }
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "changeCase",
        caseType: command
      });
    }
  });
});
