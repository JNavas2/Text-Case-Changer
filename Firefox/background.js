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

// Submenu items: case functions
const cases = [
  { id: "lowerCase",    title: "lower case",    icon: "images/lowercase-16.png" },
  { id: "upperCase",    title: "UPPER CASE",    icon: "images/uppercase-16.png" },
  { id: "invertCase",   title: "Invert cASE",   icon: "images/invertcase-16.png" },
  { id: "sentenceCase", title: "Sentence Case", icon: "images/sentencecase-16.png" },
  { id: "startCase",    title: "Start Case",    icon: "images/startcase-16.png" },
  { id: "titleCase",    title: "Title Case",    icon: "images/titlecase-16.png" },
  { id: "camelCase",    title: "camelCase",     icon: "images/camelcase-16.png" },
  { id: "snakeCase",    title: "snake_case",    icon: "images/snakecase-16.png" },
];

// Create submenu items
cases.forEach(item => {
  const menuItem = {
    id: `text-case-changer-${item.id}`,
    parentId: "text-case-changer",
    title: item.title,
    contexts: ["selection", "editable"]
  };
  // Add icon if specified
  if (item.icon) {
    menuItem.icons = { "16": item.icon };
  }
  browser.contextMenus.create(menuItem);
});

// Handle menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  const prefix = "text-case-changer-";
  if (info.menuItemId.startsWith(prefix)) {
    const caseType = info.menuItemId.replace(prefix, "");
    browser.tabs.sendMessage(tab.id, {
      action: "changeCase",
      caseType: caseType
    });
  }
});
