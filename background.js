/**
 * BACKGROUND.JS of TEXT CASE CHANGER, an EXTENSION for MOZILLA FIREFOX
 * © JOHN NAVAS 2025, ALL RIGHTS RESERVED
 */

// Create the parent context menu for editable selections
browser.contextMenus.create({
  id: "text-case-changer",
  title: "Text Case Changer",
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"]
});

// Submenu items: case functions
const cases = [
  { id: "lowerCase", title: "lower Case" },
  { id: "upperCase", title: "UPPER Case" },
  { id: "invertCase", title: "Invert Case" },
  { id: "sentenceCase", title: "Sentence Case" },
  { id: "startCase", title: "Start Case" },
  { id: "titleCase", title: "Title Case" },
  { id: "camelCase", title: "camelCase" },
  { id: "snakeCase", title: "snake_case" }
];

// Create submenu items
cases.forEach(item => {
  browser.contextMenus.create({
    id: `text-case-changer-${item.id}`,
    parentId: "text-case-changer",
    title: item.title,
    contexts: ["selection"]
  });
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
