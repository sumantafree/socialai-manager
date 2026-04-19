const API_URL = "http://localhost:8000";

// ─── State ────────────────────────────────────────────────────
let selectedPlatform = "instagram";
let generatedContent = null;

// ─── Tab Navigation ──────────────────────────────────────────
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

// ─── Platform Selection ───────────────────────────────────────
document.querySelectorAll(".platform-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".platform-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedPlatform = btn.dataset.platform;
  });
});

// ─── Generate Content ─────────────────────────────────────────
document.getElementById("generateBtn").addEventListener("click", async () => {
  const topic = document.getElementById("topic").value.trim();
  const tone = document.getElementById("tone").value;
  if (!topic) return;

  const btn = document.getElementById("generateBtn");
  btn.disabled = true;
  btn.textContent = "✨ Generating…";
  document.getElementById("result").style.display = "none";

  try {
    const token = await getStoredToken();
    const response = await fetch(`${API_URL}/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ platform: selectedPlatform, topic, tone, niche: "" }),
    });

    if (response.ok) {
      generatedContent = await response.json();
    } else {
      // Demo fallback
      generatedContent = {
        hook: `🔥 This ONE ${topic} hack changed everything for me…`,
        caption: `Most people struggle with ${topic} because they approach it backwards.\n\nHere's the 3-step framework:\n\n1️⃣ Start with outcomes\n2️⃣ Build systems\n3️⃣ Track consistently\n\nSave this! 💾`,
        cta: `Drop a 🙌 if this helped! Follow for more tips.`,
        hashtags: ["#growth", "#success", "#mindset", "#entrepreneur"],
      };
    }

    document.getElementById("resultHook").textContent = generatedContent.hook;
    document.getElementById("resultCaption").textContent = generatedContent.caption;
    document.getElementById("result").style.display = "block";
  } catch (err) {
    console.error(err);
    generatedContent = {
      hook: `Here's what nobody tells you about ${topic}…`,
      caption: `${topic} matters more than most people realise.\n\n3 things to know:\n1. Start small\n2. Stay consistent\n3. Measure results`,
      hashtags: ["#growth", "#success"],
    };
    document.getElementById("resultHook").textContent = generatedContent.hook;
    document.getElementById("resultCaption").textContent = generatedContent.caption;
    document.getElementById("result").style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ Generate Content";
  }
});

// ─── Copy All ─────────────────────────────────────────────────
document.getElementById("copyBtn").addEventListener("click", () => {
  if (!generatedContent) return;
  const text = [
    generatedContent.hook,
    "",
    generatedContent.caption,
    "",
    generatedContent.cta || "",
    "",
    (generatedContent.hashtags || []).join(" "),
  ].join("\n").trim();
  navigator.clipboard.writeText(text);
  const btn = document.getElementById("copyBtn");
  btn.textContent = "✅ Copied!";
  setTimeout(() => (btn.textContent = "📋 Copy All"), 2000);
});

// ─── Capture Current Page ─────────────────────────────────────
(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      document.getElementById("currentPage").innerHTML =
        `<strong>${tab.title?.slice(0, 60)}…</strong><br><span style="color:#475569">${tab.url?.slice(0, 60)}…</span>`;
    }
  } catch {}
})();

document.getElementById("captureBtn").addEventListener("click", async () => {
  const note = document.getElementById("captureNote").value.trim();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const idea = {
    url: tab?.url || "",
    title: tab?.title || "",
    note,
    savedAt: new Date().toISOString(),
  };

  const existing = await getStoredIdeas();
  existing.unshift(idea);
  chrome.storage.local.set({ ideas: existing.slice(0, 50) });

  document.getElementById("captureSuccess").style.display = "block";
  setTimeout(() => (document.getElementById("captureSuccess").style.display = "none"), 2500);
  document.getElementById("captureNote").value = "";
});

// ─── Load Saved Ideas ─────────────────────────────────────────
document.querySelector('[data-tab="ideas"]').addEventListener("click", loadIdeas);

async function loadIdeas() {
  const ideas = await getStoredIdeas();
  const list = document.getElementById("ideasList");
  if (!ideas.length) {
    list.innerHTML = `<div style="color:#64748b;font-size:12px;text-align:center;padding:20px">No saved ideas yet.<br>Use the Capture tab!</div>`;
    return;
  }
  list.innerHTML = ideas
    .map(
      (idea, i) => `
      <div class="idea-item" onclick="generateFromIdea(${i})">
        <div class="idea-text">${idea.title?.slice(0, 60) || idea.url?.slice(0, 60)}</div>
        ${idea.note ? `<div class="idea-meta">📝 ${idea.note.slice(0, 80)}</div>` : ""}
        <div class="idea-meta">🕐 ${new Date(idea.savedAt).toLocaleDateString()}</div>
      </div>
    `
    )
    .join("");
}

window.generateFromIdea = async (index) => {
  const ideas = await getStoredIdeas();
  const idea = ideas[index];
  document.getElementById("topic").value = idea.note || idea.title || idea.url;
  document.querySelector('[data-tab="generate"]').click();
};

// ─── Helpers ─────────────────────────────────────────────────
function getStoredToken() {
  return new Promise((resolve) => chrome.storage.local.get("auth_token", (d) => resolve(d.auth_token)));
}

function getStoredIdeas() {
  return new Promise((resolve) => chrome.storage.local.get("ideas", (d) => resolve(d.ideas || [])));
}
