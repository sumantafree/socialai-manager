// SocialAI Manager — Content Script
// Adds a floating "Generate Post" button when text is selected on any webpage

let floatingBtn = null;

document.addEventListener("mouseup", (e) => {
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 20) {
    showButton(e.clientX, e.clientY, selection);
  } else {
    hideButton();
  }
});

document.addEventListener("mousedown", (e) => {
  if (floatingBtn && !floatingBtn.contains(e.target)) {
    hideButton();
  }
});

function showButton(x, y, text) {
  hideButton();
  floatingBtn = document.createElement("button");
  floatingBtn.textContent = "✨ Generate Post";
  floatingBtn.style.cssText = `
    position: fixed;
    left: ${Math.min(x, window.innerWidth - 180)}px;
    top: ${y - 50}px;
    z-index: 999999;
    padding: 7px 14px;
    background: linear-gradient(135deg, #1570eb, #7c3aed);
    color: white;
    border: none;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(21,112,235,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    transition: transform 0.1s;
  `;
  floatingBtn.onmouseenter = () => (floatingBtn.style.transform = "scale(1.05)");
  floatingBtn.onmouseleave = () => (floatingBtn.style.transform = "scale(1)");
  floatingBtn.onclick = () => {
    chrome.storage.local.set({ pendingTopic: text });
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
    hideButton();
  };
  document.body.appendChild(floatingBtn);
}

function hideButton() {
  if (floatingBtn) {
    floatingBtn.remove();
    floatingBtn = null;
  }
}
