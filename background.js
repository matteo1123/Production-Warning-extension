// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToFocusMode",
    title: "Add to Focus Mode Quick Links",
    contexts: ["link"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToFocusMode") {
    const linkUrl = info.linkUrl;
    const linkText = info.linkText || new URL(linkUrl).hostname;
    
    // Get existing focus mode data
    chrome.storage.sync.get(['focusMode'], function(result) {
      const focusMode = result.focusMode || { links: [] };
      
      // Add new link if we haven't reached the limit
      if (!focusMode.links) focusMode.links = [];
      
      if (focusMode.links.length < 8) {
        focusMode.links.push({
          key: linkText,
          value: linkUrl
        });
        
        // Save updated focus mode data
        chrome.storage.sync.set({ focusMode }, () => {
          // Show notification
          chrome.action.setBadgeText({ text: "+" });
          chrome.action.setBadgeBackgroundColor({ color: "#cc0000" });
          
          // Clear badge after 2 seconds
          setTimeout(() => {
            chrome.action.setBadgeText({ text: "" });
          }, 2000);
        });
      }
    });
  }
}); 