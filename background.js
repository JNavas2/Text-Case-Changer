// Create the parent context menu for editable selections
browser.contextMenus.create({
  id: "text-case-changer",
  title: "Text Case Changer",
  contexts: ["selection"],
  documentUrlPatterns: ["<all_urls>"]
});

// Submenu item UPPER
browser.contextMenus.create({
  id: "text-case-changer-upper",
  parentId: "text-case-changer",
  title: "UPPER",
  contexts: ["selection"]
});

// Submenu item lower
browser.contextMenus.create({
  id: "text-case-changer-lower",
  parentId: "text-case-changer",
  title: "lower",
  contexts: ["selection"]
});

// Handle menu clicks
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (
    info.menuItemId === "text-case-changer-upper" ||
    info.menuItemId === "text-case-changer-lower"
  ) {
    const isUpper = info.menuItemId === "text-case-changer-upper";
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: (isUpper, parseText, upperCase, lowerCase, reassembleText) => {
        const active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
          const start = active.selectionStart;
          const end = active.selectionEnd;
          if (start !== end) {
            const selected = active.value.substring(start, end);
            let parsed = parseText(selected);
            if (isUpper) {
              parsed = upperCase(parsed);
            } else {
              parsed = lowerCase(parsed);
            }
            const result = reassembleText(parsed);
            active.setRangeText(result, start, end, "end");
          }
        }
      },
      args: [isUpper, parseText, upperCase, lowerCase, reassembleText],
      // The following line is required by Firefox for functions with closures:
      world: "MAIN"
    });
  }
});
