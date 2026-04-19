// SocialAI Manager — Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "socialai-generate",
    title: "Generate Social Post from Selection",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "socialai-generate") {
    const text = info.selectionText?.trim();
    if (text) {
      await chrome.storage.local.set({ pendingTopic: text });
      chrome.action.openPopup();
    }
  }
});

// Notification helper
function notify(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title,
    message,
  });
}

// Listen for post scheduled events from popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "POST_SCHEDULED") {
    notify("Post Scheduled ✅", `Your ${message.platform} post has been scheduled.`);
  }
  if (message.type === "POST_PUBLISHED") {
    notify("Post Published 🚀", `Your ${message.platform} post is live!`);
  }
});
