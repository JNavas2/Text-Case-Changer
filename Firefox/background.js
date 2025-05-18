/**
 * BACKGROUND.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Onboarding/Upboarding welcome with Remove button
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install" || details.reason === "update") {
    browser.tabs.create({
      url: browser.runtime.getURL("onboarding.html")
    });
  }
});

// Create the parent context menu for editable selections
browser.contextMenus.create({
  id: "text-case-changer",
  title: "Text Case Changer",
  contexts: ["selection", "editable"],
});

// Submenu items: case functions with shortcuts in titles
const cases = [
  { id: "lowerCase",    title: "lower case (Ctrl+Shift+L)",    icon: "images/lowercase-16.png" },
  { id: "upperCase",    title: "UPPER CASE (Ctrl+Shift+U)",    icon: "images/uppercase-16.png" },
  { id: "invertCase",   title: "Invert cASE (Ctrl+Shift+2)",   icon: "images/invertcase-16.png" },
  { id: "sentenceCase", title: "Sentence Case (Ctrl+Shift+3)", icon: "images/sentencecase-16.png" },
  { id: "startCase",    title: "Start Case (Ctrl+Shift+4)",    icon: "images/startcase-16.png" },
  { id: "titleCase",    title: "Title Case (Ctrl+Shift+H)",    icon: "images/titlecase-16.png" },
  { id: "camelCase",    title: "camelCase (Ctrl+Shift+Y)",     icon: "images/camelcase-16.png" },
  { id: "snakeCase",    title: "snake_case (Ctrl+Shift+X)",    icon: "images/snakecase-16.png" },
];

// Create submenu items with icons and updated titles
cases.forEach(item => {
  browser.contextMenus.create({
    id: `text-case-changer-${item.id}`,
    parentId: "text-case-changer",
    title: item.title,
    contexts: ["selection", "editable"],
    icons: { "16": item.icon }
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  const prefix = "text-case-changer-";
  if (info.menuItemId.startsWith(prefix)) {
    const caseType = info.menuItemId.replace(prefix, "");
    if (tab && tab.id) {
      browser.tabs.sendMessage(tab.id, {
        action: "changeCase",
        caseType: caseType
      });
    }
  }
});

// Handle keyboard shortcut commands
browser.commands.onCommand.addListener((command) => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      browser.tabs.sendMessage(tabs[0].id, {
        action: "changeCase",
        caseType: command
      });
    }
  }).catch((error) => {
    console.error("Error sending command message:", error);
  });
});
